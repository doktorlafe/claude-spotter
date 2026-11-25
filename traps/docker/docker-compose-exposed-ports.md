---
id: docker-compose-exposed-ports
title: Ports in docker-compose bypass your firewall too — bind them to 127.0.0.1
domain: docker
severity: medium
on: file
path: '(^|[\\/])(docker-)?compose[^\\/]*\.ya?ml$'
match: '^\s*-\s*["'']?\d+:\d+'
flags: im
hit:
  - "compose.yaml ::: ports:\n      - \"5432:5432\""
miss:
  - "docker-compose.yml ::: ports:\n      - \"127.0.0.1:5432:5432\""
  - "config.yml :::       - \"5432:5432\""
---
A `ports:` entry like `"5432:5432"` publishes the port on every network interface, and Docker's iptables rules
skip ufw/firewalld — so it is reachable from the internet even if your firewall "blocks" it.

Instead: `"127.0.0.1:5432:5432"` for things only this host needs, or drop `ports:` entirely and let containers talk
over the compose network (services reach each other by service name, no published port needed).
