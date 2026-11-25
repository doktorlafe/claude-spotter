---
id: docker-compose-down-volumes
title: "docker compose down -v deletes your volumes — database data included"
domain: docker
severity: high
on: command
match: 'docker[- ]compose\s+(\S+\s+)*down\b.*(\s-v\b|--volumes)'
hit:
  - docker compose down -v
  - docker-compose -f prod.yml down --volumes
miss:
  - docker compose down
  - docker compose up -d
---
`-v` / `--volumes` removes the named volumes declared in the compose file. That is where Postgres, MySQL, Redis etc.
keep their data — it is gone, with no recycle bin.

If you only want to restart or rebuild: `docker compose down` (no `-v`) keeps the data. Back up first
(e.g. `docker compose exec db pg_dump ...`) if you really want a clean slate.
