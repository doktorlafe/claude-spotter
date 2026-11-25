---
id: ufw-enable-ssh-lockout
title: Enabling ufw over SSH without allowing SSH first locks you out of the server
domain: linux
severity: high
on: command
match: '\bufw\s+(--force\s+)?enable\b'
hit:
  - sudo ufw enable
  - sudo ufw --force enable
miss:
  - sudo ufw allow OpenSSH
  - sudo ufw status
---
ufw's default policy denies incoming connections. If port 22 (or your custom SSH port) isn't allowed yet, enabling
it on a remote server cuts your current session and you can only get back in via the provider's web console.

First: `sudo ufw allow OpenSSH` (or `sudo ufw allow 2222/tcp` for a custom port), check with `sudo ufw show added`,
then enable.
