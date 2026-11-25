---
id: git-add-secrets
title: You are about to commit a secrets file — once pushed, assume it is leaked
domain: git
severity: high
on: command
match: '\bgit\s+add\b.*(\s|/)(\.env(\.local|\.production)?|id_rsa|id_ed25519|[^\s/]+\.pem|[^\s/]+\.key|credentials\.json)(\s|$)'
hit:
  - git add .env
  - git add config/credentials.json src/app.js
miss:
  - git add .env.example
  - git add src/app.js
---
Files like `.env`, private keys and `credentials.json` usually hold passwords and API keys. After a push to a public
repo, bots scrape them within minutes; deleting the file in a later commit does not remove it from history.

Add the file to `.gitignore`, commit an `.env.example` with placeholder values instead, and if a real secret was
ever pushed: rotate (revoke and re-create) it.
