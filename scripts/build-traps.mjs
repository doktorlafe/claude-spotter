#!/usr/bin/env node
// Collect traps/**/*.md → dist/traps.json, validating every trap (format, regexes, hit/miss examples).
// Usage: node scripts/build-traps.mjs [--check]   (--check validates without writing)

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseTrap, validateTrap } from '../hooks/lib/core.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.md') ? [join(dir, e.name)] : []);
}

export function buildTraps(trapsDir = join(ROOT, 'traps')) {
  const problems = [];
  const traps = [];
  const seen = new Set();
  for (const file of walk(trapsDir).sort()) {
    const rel = relative(ROOT, file).replace(/\\/g, '/');
    let trap;
    try { trap = parseTrap(readFileSync(file, 'utf8'), rel); } catch (e) { problems.push(e.message); continue; }
    const errs = validateTrap(trap);
    if (trap.id && basename(file, '.md') !== trap.id) errs.push(`file name must be ${trap.id}.md`);
    if (trap.domain && basename(dirname(file)) !== trap.domain) errs.push(`must live in traps/${trap.domain}/`);
    if (seen.has(trap.id)) errs.push(`duplicate id ${trap.id}`);
    seen.add(trap.id);
    if (errs.length) problems.push(...errs.map((e) => `${rel}: ${e}`));
    else traps.push(trap);
  }
  return { traps, problems };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { traps, problems } = buildTraps();
  if (problems.length) {
    console.error(`✗ ${problems.length} problem(s):\n  ` + problems.join('\n  '));
    process.exit(1);
  }
  if (!process.argv.includes('--check')) {
    mkdirSync(join(ROOT, 'dist'), { recursive: true });
    writeFileSync(join(ROOT, 'dist', 'traps.json'), JSON.stringify(traps, null, 2) + '\n');
  }
  console.log(`✓ ${traps.length} traps OK`);
}
