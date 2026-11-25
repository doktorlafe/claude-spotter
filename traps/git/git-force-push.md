---
id: git-force-push
title: Force-pushing overwrites the remote branch — others' commits can silently disappear
domain: git
severity: high
on: command
match: '\bgit\s+push\b.*(\s--force\b|\s-f\b)'
unless: '--force-with-lease|--force-if-includes'
hit:
  - git push --force origin main
  - git push -f
miss:
  - git push --force-with-lease
  - git push origin main
---
`--force` replaces the remote branch with yours. Any commit someone (or another machine, or CI) pushed since your
last fetch is dropped from the branch.

If you rewrote history on purpose, use `git push --force-with-lease`: it refuses when the remote has commits you
haven't seen. Never force-push a shared `main`.
