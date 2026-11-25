#!/usr/bin/env node
// Spotter hook entry point. Claude Code pipes hook JSON on stdin; we answer with JSON on stdout.
// Also a tiny CLI:  node spotter.mjs --cli list | stats | mute <id> | unmute <id>
// It must never break the user's session: any failure → exit 0 silently.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contextFor, selectTrap, buildResponse } from './lib/core.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOME = process.env.SPOTTER_HOME || join(homedir(), '.claude', 'spotter');
const STATE = join(HOME, 'state.json');
const MAX = Number(process.env.SPOTTER_MAX) || 3;
const MODE = process.env.SPOTTER_MODE || 'guard'; // guard | soft | off

const loadTraps = () => JSON.parse(readFileSync(join(ROOT, 'dist', 'traps.json'), 'utf8'));

function loadState() {
  try {
    const s = JSON.parse(readFileSync(STATE, 'utf8'));
    return { sessions: s.sessions ?? {}, muted: s.muted ?? [], stats: s.stats ?? {} };
  } catch {
    return { sessions: {}, muted: [], stats: {} };
  }
}

function saveState(state) {
  // keep only the 50 most recent sessions
  const ids = Object.keys(state.sessions).sort((a, b) => state.sessions[b].t - state.sessions[a].t);
  for (const id of ids.slice(50)) delete state.sessions[id];
  mkdirSync(HOME, { recursive: true });
  writeFileSync(STATE, JSON.stringify(state, null, 2));
}

async function readStdin() {
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

async function hook() {
  if (MODE === 'off') return;
  const input = JSON.parse(await readStdin());
  const ctx = contextFor(input);
  if (!ctx) return;
  const state = loadState();
  const sid = input.session_id || 'unknown';
  const session = (state.sessions[sid] ??= { fired: [], t: Date.now() });
  const trap = selectTrap(loadTraps(), ctx, { fired: session.fired, muted: state.muted, max: MAX });
  if (!trap) return;
  session.fired.push(trap.id);
  session.t = Date.now();
  state.stats[trap.id] = (state.stats[trap.id] ?? 0) + 1;
  saveState(state);
  process.stdout.write(JSON.stringify(buildResponse(trap, ctx, { mode: MODE })));
}

function cli([cmd = 'list', id]) {
  const traps = loadTraps();
  const state = loadState();
  const out = (s) => process.stdout.write(s + '\n');
  if (cmd === 'list') {
    out(`Spotter knows ${traps.length} traps:\n`);
    for (const t of traps) out(`${state.muted.includes(t.id) ? '🔇' : '  '} [${t.domain}] ${t.id} (${t.severity}) — ${t.title}`);
  } else if (cmd === 'stats') {
    const entries = Object.entries(state.stats).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((n, [, c]) => n + c, 0);
    out(`🛟 Spotter caught you ${total} time(s) across ${Object.keys(state.sessions).length} recent session(s).`);
    for (const [tid, c] of entries) out(`  ${c}× ${tid}`);
    if (state.muted.length) out(`\nMuted: ${state.muted.join(', ')}`);
  } else if (cmd === 'mute' || cmd === 'unmute') {
    if (!traps.some((t) => t.id === id)) return out(`Unknown trap "${id}". Try: list`);
    state.muted = state.muted.filter((m) => m !== id);
    if (cmd === 'mute') state.muted.push(id);
    saveState(state);
    out(`${cmd === 'mute' ? '🔇 Muted' : '🔊 Unmuted'} ${id}.`);
  } else {
    out('Usage: list | stats | mute <id> | unmute <id>');
  }
}

const args = process.argv.slice(2);
try {
  if (args[0] === '--cli') cli(args.slice(1));
  else await hook();
} catch (e) {
  if (process.env.SPOTTER_DEBUG) process.stderr.write(String(e?.stack ?? e) + '\n');
}
process.exit(0);
