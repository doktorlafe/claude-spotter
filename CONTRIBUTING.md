# Add a trap in 5 minutes

The best traps are the ones that cost you an evening and that a senior colleague would have warned you about in
one sentence.

## 1. Create `traps/<domain>/<id>.md`

```markdown
---
id: docker-compose-down-volumes
title: "docker compose down -v deletes your volumes — database data included"
domain: docker
severity: high
on: command
match: 'docker[- ]compose\s+(\S+\s+)*down\b.*(\s-v\b|--volumes)'
hit:
  - docker compose down -v
miss:
  - docker compose down
---
Two or three short sentences: what actually happens, and why it bites.

Then the better way, with the exact command.
```

| Field | Meaning |
|---|---|
| `id` | kebab-case, same as the file name |
| `title` | the one line the user sees (at most 120 characters) |
| `domain` | same as the folder name |
| `severity` | `high` / `medium` pause the command once; `low` only adds a note |
| `on` | `prompt`, `command`, `file` or `output` (see below) |
| `match` | JavaScript regex, case-insensitive by default (`flags:` overrides) |
| `unless` | optional regex that cancels the match |
| `hit` / `miss` | examples that must / must not match. CI checks them. |

The frontmatter is a small YAML subset: `key: value` lines and `- item` lists, with no inline `#` comments.

### Triggers

| `on:` | What `match` is tested against |
|---|---|
| `prompt` | what the user types to Claude (use it for "starting a topic" maps, e.g. IRC) |
| `command` | a shell command, right before Claude runs it |
| `file` | file content being written (also needs `path:`, a regex on the file path; examples are `path ::: content`) |
| `output` | output and errors of a shell command that just ran |

### Regex tips

- Use single quotes in YAML; a literal `'` is written as `''`.
- Use `flags: im` for multi-line file content (`^` matches each line).
- Keep it **precise**. A trap that fires on harmless commands gets muted, and then it helps nobody.

## 2. Check it

```bash
npm test         # validates every trap and runs its hit/miss examples
npm run build    # regenerates dist/traps.json (commit it together with your trap)
```

## 3. Writing the advice

- Write it for someone smart who has never seen this before. No jargon without explanation.
- State facts and the better way. Don't moralise.
- English, so everyone can use it. Claude passes it on in the user's own language.
