---
id: env-file-gitignore
title: Creating a .env file — make sure it is in .gitignore before the next commit
domain: git
severity: low
on: file
path: '(^|[\\/])\.env(\.local|\.production|\.development)?$'
match: '.*'
hit:
  - /home/me/app/.env ::: DATABASE_URL=postgres://user:pass@localhost/db
miss:
  - /home/me/app/.env.example ::: DATABASE_URL=
---
`.env` files hold real credentials. `git add .` or `git commit -a` will happily include them unless `.gitignore`
lists them.

Check with `git check-ignore -v .env` (prints the matching rule if it is ignored). Keep a committed `.env.example`
with placeholders so others know which variables exist.
