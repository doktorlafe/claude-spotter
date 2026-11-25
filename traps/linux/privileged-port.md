---
id: privileged-port
title: Ports below 1024 need root — don't run your app as root to get port 80
domain: linux
severity: low
on: output
match: 'listen EACCES:? permission denied \S*:\d{1,3}\b|bind\(\) to \S+:\d{1,3} failed \(13'
hit:
  - "Error: listen EACCES: permission denied 0.0.0.0:80"
  - "nginx: [emerg] bind() to 0.0.0.0:80 failed (13: Permission denied)"
miss:
  - "Error: listen EADDRINUSE: address already in use :::3000"
---
On Linux, ports 0–1023 are "privileged": only root may listen on them. The tempting fix — `sudo node app.js` — runs
your whole app as root, so any bug in it becomes full control of the machine.

Usual setup: run the app on a high port (3000, 8080) as a normal user and put nginx/Caddy on 80/443 as a reverse
proxy. Alternatives: `sudo setcap 'cap_net_bind_service=+ep' $(which node)` or a systemd socket.
