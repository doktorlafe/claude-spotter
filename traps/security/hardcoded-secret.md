---
id: hardcoded-secret
title: A secret is being written straight into source code
domain: security
severity: medium
on: file
path: '\.(py|js|mjs|cjs|ts|tsx|jsx|go|rb|php|java|cs|swift|kt)$'
match: '((api[_-]?key|secret|passw(or)?d|token)\w*["'']?\s*[:=]\s*["''][A-Za-z0-9_\-./+=]{12,}["'']|\bsk-[A-Za-z0-9_-]{20,}|\bAKIA[0-9A-Z]{16}\b|\bghp_[A-Za-z0-9]{30,}|\bxox[bp]-[A-Za-z0-9-]{10,})'
hit:
  - config.py ::: API_KEY = "sk-live-1234567890abcdefghijkl"
  - db.js ::: const password = 'hunter2hunter2hunter2'
miss:
  - config.py ::: API_KEY = os.environ["API_KEY"]
---
Secrets in code end up in git history, screenshots, logs and every copy of the repo — and are painful to rotate.

Read them from the environment (`os.environ["API_KEY"]`, `process.env.API_KEY`), keep local values in a gitignored
`.env`, and commit a `.env.example` with placeholders.
