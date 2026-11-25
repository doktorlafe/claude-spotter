---
id: ssh-key-permissions
title: SSH refuses a private key that other users could read
domain: linux
severity: low
on: output
match: 'UNPROTECTED PRIVATE KEY FILE|Permissions 0\d+ for .+ are too open'
hit:
  - "Permissions 0644 for '/home/me/.ssh/id_ed25519' are too open."
miss:
  - "Permission denied (publickey)."
---
SSH ignores private keys that are readable by group/others — a safety check, not a bug.

Fix: `chmod 600 ~/.ssh/id_ed25519` and `chmod 700 ~/.ssh`. On Windows, the key must be owned by and readable only
by your user (remove "Users"/"Everyone" in the file's Security tab or with `icacls`).
