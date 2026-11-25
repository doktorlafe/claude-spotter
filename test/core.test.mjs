import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTrap, validateTrap, matchTrap, contextFor, selectTrap, buildResponse } from '../hooks/lib/core.mjs';

const SAMPLE = `---
id: sample-trap
title: Sample title
domain: demo
severity: high
on: command
match: 'docker run.*-p\\s*\\d+:'
unless: '127\\.0\\.0\\.1'
hit:
  - docker run -p 5432:5432 postgres
miss:
  - docker run -p 127.0.0.1:5432:5432 postgres
---
Body text.
`;

test('parseTrap reads frontmatter, lists and body (CRLF too)', () => {
  const t = parseTrap(SAMPLE.replace(/\n/g, '\r\n'));
  assert.equal(t.id, 'sample-trap');
  assert.equal(t.match, 'docker run.*-p\\s*\\d+:');
  assert.deepEqual(t.hit, ['docker run -p 5432:5432 postgres']);
  assert.equal(t.body, 'Body text.');
});

test('parseTrap rejects files without frontmatter', () => {
  assert.throws(() => parseTrap('no frontmatter'), /frontmatter/);
});

test('validateTrap accepts a good trap and checks examples', () => {
  assert.deepEqual(validateTrap(parseTrap(SAMPLE)), []);
  const bad = parseTrap(SAMPLE.replace('  - docker run -p 127.0.0.1:5432:5432 postgres', '  - docker run -p 80:80 nginx'));
  assert.match(validateTrap(bad).join(), /miss example matches/);
});

test('matchTrap honours unless and trigger type', () => {
  const t = parseTrap(SAMPLE);
  assert.ok(matchTrap(t, { on: 'command', text: 'docker run -p 80:80 nginx' }));
  assert.ok(!matchTrap(t, { on: 'command', text: 'docker run -p 127.0.0.1:80:80 nginx' }));
  assert.ok(!matchTrap(t, { on: 'prompt', text: 'docker run -p 80:80 nginx' }));
});

test('file traps match on path and content', () => {
  const t = { on: 'file', path: '\\.env$', match: 'KEY=', flags: '' };
  assert.ok(matchTrap(t, { on: 'file', path: '/app/.env', text: 'API_KEY=1' }));
  assert.ok(!matchTrap(t, { on: 'file', path: '/app/env.js', text: 'API_KEY=1' }));
});

test('contextFor maps hook events', () => {
  assert.deepEqual(contextFor({ hook_event_name: 'UserPromptSubmit', prompt: 'hi' }), { event: 'UserPromptSubmit', on: 'prompt', text: 'hi' });
  assert.equal(contextFor({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'ls' } }).on, 'command');
  assert.equal(contextFor({ hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: 'a', content: 'b' } }).text, 'b');
  assert.equal(contextFor({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_response: { stdout: 'out', stderr: '' } }).text, 'out');
  assert.equal(contextFor({ hook_event_name: 'PostToolUseFailure', tool_name: 'Bash', error: 'boom' }).text, 'boom');
  assert.equal(contextFor({ hook_event_name: 'PreToolUse', tool_name: 'Read' }), null);
  // regression: Spotter's own `--cli list` output contains trap titles and must not trigger output traps
  assert.equal(contextFor({ hook_event_name: 'PostToolUse', tool_name: 'Bash',
    tool_input: { command: 'node "/x/hooks/spotter.mjs" --cli' }, tool_response: { stdout: 'externally-managed-environment' } }), null);
});

test('selectTrap: highest severity, once per session, cap, mute', () => {
  const mk = (id, severity) => ({ id, severity, on: 'command', match: 'x' });
  const traps = [mk('low1', 'low'), mk('high1', 'high'), mk('med1', 'medium')];
  const ctx = { on: 'command', text: 'x' };
  assert.equal(selectTrap(traps, ctx).id, 'high1');
  assert.equal(selectTrap(traps, ctx, { fired: ['high1'] }).id, 'med1');
  assert.equal(selectTrap(traps, ctx, { muted: ['high1', 'med1'] }).id, 'low1');
  assert.equal(selectTrap(traps, ctx, { fired: ['a', 'b', 'c'], max: 3 }), null);
});

test('buildResponse pauses PreToolUse once in guard mode, otherwise adds context', () => {
  const trap = { id: 't', title: 'T', body: 'B', severity: 'high' };
  const pre = buildResponse(trap, { event: 'PreToolUse' });
  assert.equal(pre.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(pre.systemMessage, /Spotter: T/);
  const soft = buildResponse(trap, { event: 'PreToolUse' }, { mode: 'soft' });
  assert.equal(soft.hookSpecificOutput.permissionDecision, undefined);
  assert.match(soft.hookSpecificOutput.additionalContext, /B/);
  const low = buildResponse({ ...trap, severity: 'low' }, { event: 'PreToolUse' });
  assert.equal(low.hookSpecificOutput.permissionDecision, undefined);
});
