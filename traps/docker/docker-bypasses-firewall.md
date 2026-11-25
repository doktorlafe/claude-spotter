---
id: docker-bypasses-firewall
title: Docker-published ports bypass your firewall (ufw/firewalld) and are open to the internet
domain: docker
severity: high
on: command
match: 'docker\s+(container\s+)?(run|create)\b.*\s(-p|--publish)[\s=]+["'']?\d+:\d+'
unless: '(-p|--publish)[\s=]+["'']?127\.0\.0\.1:'
hit:
  - docker run -d -p 5432:5432 postgres
  - docker run --publish=8080:80 nginx
miss:
  - docker run -d -p 127.0.0.1:5432:5432 postgres
  - docker ps
---
Docker writes its own iptables rules, which run *before* ufw/firewalld. `-p 5432:5432` makes the port reachable
from the whole internet even when `ufw deny 5432` says otherwise. Bots scan for open databases within minutes.

Instead: bind to localhost when only this machine needs it — `-p 127.0.0.1:5432:5432` — or put a reverse proxy in front.
If it must be public, filter it in the `DOCKER-USER` iptables chain, not in ufw.
