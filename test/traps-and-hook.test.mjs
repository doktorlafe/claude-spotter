import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTraps } from '../scripts/build-traps.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOOK = join(ROOT, 'hooks', 'spotter.mjs');

test('every trap in traps/ is valid and dist/traps.json is up to date', () => {
  const { traps, problems } = buildTraps();
  assert.deepEqual(problems, []);
  assert.ok(traps.length >= 25, `expected a solid starter library, got ${traps.length}`);
  const dist = JSON.parse(readFileSync(join(ROOT, 'dist', 'traps.json'), 'utf8'));
  assert.deepEqual(dist, traps, 'dist/traps.json is stale — run: npm run build');
});

function run(input, env = {}, args = []) {
  const r = spawnSync(process.execPath, [HOOK, ...args], { input: input && JSON.stringify(input), encoding: 'utf8', env: { ...process.env, ...env } });
  assert.equal(r.status, 0);
  return r.stdout;
}

const bash = (command, session_id = 's1') => ({ session_id, hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command } });

test('hook: pauses a trap once, then lets the retry through', () => {
  const env = { SPOTTER_HOME: mkdtempSync(join(tmpdir(), 'spotter-')) };
  const first = JSON.parse(run(bash('docker run -d -p 5432:5432 postgres'), env));
  assert.equal(first.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(first.systemMessage, /firewall/i);
  assert.equal(run(bash('docker run -d -p 5432:5432 postgres'), env), '');
  assert.equal(run(bash('ls -la'), env), '');
});

test('hook: caps warnings per session and stays silent on garbage input', () => {
  const env = { SPOTTER_HOME: mkdtempSync(join(tmpdir(), 'spotter-')), SPOTTER_MAX: '2' };
  const cmds = ['chmod -R 777 /var/www', 'sudo pip install requests', 'git push --force origin main'];
  const outs = cmds.map((c) => run(bash(c, 'cap'), env));
  assert.deepEqual(outs.map((o) => o !== ''), [true, true, false]);
  const r = spawnSync(process.execPath, [HOOK], { input: 'not json', encoding: 'utf8', env: { ...process.env, ...env } });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
});

test('hook: prompt traps add context for Claude', () => {
  const env = { SPOTTER_HOME: mkdtempSync(join(tmpdir(), 'spotter-')) };
  const out = JSON.parse(run({ session_id: 'p', hook_event_name: 'UserPromptSubmit', prompt: 'I want to run my own IRC server' }, env));
  assert.equal(out.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
  assert.match(out.hookSpecificOutput.additionalContext, /password/i);
});

test('cli: mute silences a trap, stats counts catches', () => {
  const env = { SPOTTER_HOME: mkdtempSync(join(tmpdir(), 'spotter-')) };
  assert.match(run(null, env, ['--cli', 'mute', 'docker-bypasses-firewall']), /Muted/);
  assert.equal(run(bash('docker run -p 80:80 nginx'), env), '');
  run(bash('chmod 777 file'), env);
  assert.match(run(null, env, ['--cli', 'stats']), /1 time/);
  assert.match(run(null, env, ['--cli', 'list']), /docker-bypasses-firewall/);
});
