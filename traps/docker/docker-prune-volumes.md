---
id: docker-prune-volumes
title: Pruning volumes permanently deletes data of every stopped container
domain: docker
severity: high
on: command
match: 'docker\s+(volume\s+prune|system\s+prune\b.*--volumes)'
hit:
  - docker volume prune -f
  - docker system prune -a --volumes
miss:
  - docker system prune
  - docker image prune -a
---
`docker volume prune` (and `system prune --volumes`) deletes every volume not attached to a *running* container.
A database you just stopped for a moment counts as unused — its data goes too.

Safer: `docker system prune` (no `--volumes`) frees most space from images and build cache. Remove specific volumes
by name with `docker volume rm <name>` after checking `docker volume ls`.
