---
id: secret-already-committed
title: A leaked secret must be rotated — deleting the commit is not enough
domain: git
severity: medium
on: prompt
match: '(commit|push|nahr|github)\w*.{0,60}(password|api[ _-]?key|secret|token|heslo|klíč)|(password|api[ _-]?key|secret|token|heslo|klíč).{0,60}(commit|push|nahr|github)'
hit:
  - I accidentally committed my API key to github, how do I remove it?
  - omylem jsem commitnul heslo do repa
miss:
  - how do I write a good commit message?
---
Once a secret has been pushed, treat it as public: forks, clones, caches and secret-scanning bots may already have it.
Rewriting history (`git filter-repo`, BFG) is cleanup, not a fix.

The fix is to rotate it first — revoke the key/password at the provider and create a new one — then remove it from the
code, load it from environment variables or `.env` (gitignored), and optionally scrub history.
