---
id: disk-full
title: Disk is full — the usual suspects are Docker images, logs and caches
domain: linux
severity: low
on: output
match: 'No space left on device|ENOSPC'
hit:
  - "write /var/lib/docker/tmp/x: no space left on device"
  - "npm ERR! code ENOSPC"
miss:
  - "Done in 3.2s"
---
Before deleting things at random, see what is big: `df -h` (which disk), then `sudo du -xh / --max-depth=2 | sort -h | tail`.

Common culprits: Docker (`docker system df`, then `docker system prune` — without `--volumes`), journald logs
(`sudo journalctl --vacuum-size=200M`), package caches (`sudo apt clean`), and runaway app logs without rotation.
