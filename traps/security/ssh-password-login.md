---
id: ssh-password-login
title: SSH password/root login is the #1 target of brute-force bots
domain: security
severity: medium
on: file
path: 'sshd_config(\.d[\\/].*)?$'
match: '^\s*(PasswordAuthentication|PermitRootLogin)\s+yes'
flags: im
hit:
  - /etc/ssh/sshd_config ::: PermitRootLogin yes
  - /etc/ssh/sshd_config ::: PasswordAuthentication yes
miss:
  - /etc/ssh/sshd_config ::: PasswordAuthentication no
---
Every public server receives thousands of SSH password guesses a day, mostly for `root`.

Use keys: `ssh-copy-id user@server`, confirm key login works **in a second terminal**, then set
`PasswordAuthentication no` and `PermitRootLogin no` (or `prohibit-password`), and `sudo systemctl reload ssh`.
Keep the first session open until you've verified you can still get in.
