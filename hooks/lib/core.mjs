// Spotter core: parsing traps, matching them against what Claude is about to do,
// and building the hook response. No dependencies, no I/O — easy to test.

export const SEVERITIES = ['high', 'medium', 'low'];
export const TRIGGERS = ['prompt', 'command', 'file', 'output'];
const RANK = { high: 0, medium: 1, low: 2 };

// ---------- trap files ----------

function parseValue(raw) {
  const v = raw.trim();
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) return v.slice(1, -1).replace(/''/g, "'");
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) return JSON.parse(v);
  return v;
}

/** Parse a trap markdown file: a tiny YAML subset (key: value, key: + "- item" lists) + body. */
export function parseTrap(text, source = '<trap>') {
  const src = text.replace(/\r\n/g, '\n');
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${source}: missing --- frontmatter ---`);
  const [, head, body] = m;
  const trap = {};
  let listKey = null;
  for (const line of head.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item) {
      if (!listKey) throw new Error(`${source}: list item without a key: ${line}`);
      trap[listKey].push(parseValue(item[1]));
      continue;
    }
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv) throw new Error(`${source}: cannot parse line: ${line}`);
    const [, key, value] = kv;
    if (value === '') { trap[key] = []; listKey = key; }
    else { trap[key] = parseValue(value); listKey = null; }
  }
  trap.body = body.trim();
  return trap;
}

/** Validate a parsed trap; returns a list of problems (empty = OK). */
export function validateTrap(trap) {
  const errs = [];
  for (const k of ['id', 'title', 'domain', 'severity', 'on', 'match']) {
    if (typeof trap[k] !== 'string' || !trap[k]) errs.push(`missing "${k}"`);
  }
  if (trap.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(trap.id)) errs.push('id must be kebab-case');
  if (trap.severity && !SEVERITIES.includes(trap.severity)) errs.push(`severity must be one of ${SEVERITIES.join('|')}`);
  if (trap.on && !TRIGGERS.includes(trap.on)) errs.push(`on must be one of ${TRIGGERS.join('|')}`);
  if (trap.on === 'file' && !trap.path) errs.push('on: file needs a "path" regex');
  if (trap.title && trap.title.length > 120) errs.push('title must be at most 120 chars');
  if (!trap.body) errs.push('body (the explanation) is empty');
  for (const k of ['match', 'unless', 'path']) {
    if (trap[k]) { try { new RegExp(trap[k], trap.flags ?? 'i'); } catch (e) { errs.push(`bad ${k} regex: ${e.message}`); } }
  }
  if (!Array.isArray(trap.hit) || trap.hit.length === 0) errs.push('needs at least one "hit" example');
  if (!Array.isArray(trap.miss) || trap.miss.length === 0) errs.push('needs at least one "miss" example');
  if (errs.length) return errs;
  for (const ex of trap.hit) if (!matchTrap(trap, exampleContext(trap, ex))) errs.push(`hit example does not match: ${ex}`);
  for (const ex of trap.miss) if (matchTrap(trap, exampleContext(trap, ex))) errs.push(`miss example matches: ${ex}`);
  return errs;
}

/** Examples for file traps are written as "path ::: content". */
export function exampleContext(trap, example) {
  if (trap.on === 'file') {
    const [path, ...rest] = example.split(' ::: ');
    return { on: 'file', path, text: rest.join(' ::: ') };
  }
  return { on: trap.on, text: example };
}

// ---------- matching ----------

const re = (src, flags) => new RegExp(src, flags ?? 'i');

export function matchTrap(trap, ctx) {
  if (!ctx || trap.on !== ctx.on) return false;
  const text = ctx.text ?? '';
  if (trap.on === 'file') {
    if (!re(trap.path, trap.flags).test(ctx.path ?? '')) return false;
    if (trap.match !== '.*' && !re(trap.match, trap.flags).test(text)) return false;
  } else if (!re(trap.match, trap.flags).test(text)) return false;
  if (trap.unless && re(trap.unless, trap.flags).test(text)) return false;
  return true;
}

/** Turn Claude Code hook input into what Spotter looks at. */
export function contextFor(input) {
  const ev = input?.hook_event_name;
  const tool = input?.tool_name;
  const ti = input?.tool_input ?? {};
  if (ev === 'UserPromptSubmit') return { event: ev, on: 'prompt', text: String(input.prompt ?? '') };
  if (ev === 'PreToolUse' && tool === 'Bash') return { event: ev, on: 'command', text: String(ti.command ?? '') };
  if (ev === 'PreToolUse' && ['Write', 'Edit', 'MultiEdit'].includes(tool)) {
    const text = ti.content ?? ti.new_string ?? (ti.edits ?? []).map((e) => e.new_string).join('\n');
    return { event: ev, on: 'file', path: String(ti.file_path ?? ''), text: String(text ?? '') };
  }
  if ((ev === 'PostToolUse' || ev === 'PostToolUseFailure') && tool === 'Bash') {
    // Spotter's own CLI prints trap titles — never treat that as a real error.
    if (/spotter\.mjs/.test(String(ti.command ?? ''))) return null;
    const r = input.tool_response;
    const out = input.error ?? (typeof r === 'string' ? r : [r?.stdout, r?.stderr].filter(Boolean).join('\n'));
    return { event: ev, on: 'output', text: String(out ?? '') };
  }
  return null;
}

/** Pick at most one trap to fire, respecting mutes, once-per-session and the session cap. */
export function selectTrap(traps, ctx, { fired = [], muted = [], max = 3 } = {}) {
  if (!ctx || fired.length >= max) return null;
  const candidates = traps
    .filter((t) => !muted.includes(t.id) && !fired.includes(t.id) && matchTrap(t, ctx))
    .sort((a, b) => RANK[a.severity] - RANK[b.severity]);
  return candidates[0] ?? null;
}

// ---------- response ----------

export function buildResponse(trap, ctx, { mode = 'guard' } = {}) {
  const note =
    `Spotter (a plugin the user installed that flags well-known pitfalls) matched trap "${trap.id}": ${trap.title}\n\n` +
    `${trap.body}\n\n` +
    `Briefly tell the user about this pitfall in their language and, if it applies, adjust the approach.`;
  const res = { systemMessage: `🛟 Spotter: ${trap.title}` };
  const blocking = mode === 'guard' && ctx.event === 'PreToolUse' && trap.severity !== 'low';
  if (blocking) {
    res.hookSpecificOutput = {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        `${note}\nSpotter pauses this only once per session: if, knowing this, it is still the right call, run it again unchanged.`,
    };
  } else {
    res.hookSpecificOutput = { hookEventName: ctx.event, additionalContext: note };
  }
  return res;
}
