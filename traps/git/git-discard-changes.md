---
id: git-discard-changes
title: This throws away uncommitted work — git has no undo for it
domain: git
severity: high
on: command
match: '\bgit\s+(reset\s+(\S+\s+)*--hard|clean\s+-\w*f|checkout\s+(--\s+)?\.(\s|$)|restore\s+(--\S+\s+)*\.(\s|$))'
hit:
  - git reset --hard HEAD~1
  - git clean -fd
  - git checkout -- .
miss:
  - git reset --soft HEAD~1
  - git checkout main
---
`reset --hard`, `clean -f`, `checkout .` and `restore .` delete changes that were never committed. Committed work can
usually be recovered with `git reflog`; uncommitted edits and untracked files cannot.

Safer first step: `git stash -u` keeps everything recoverable (`git stash pop`). Check what would go with
`git status` and `git clean -n` (dry run).
