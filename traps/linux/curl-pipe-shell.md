---
id: curl-pipe-shell
title: Piping curl into a shell runs whatever the server sends — unseen, often as root
domain: linux
severity: medium
on: command
match: '\b(curl|wget)\b[^|]*\|\s*(sudo\s+)?(-\w+\s+)*(ba|z)?sh\b'
hit:
  - curl -fsSL https://get.example.sh | sudo bash
  - wget -qO- https://example.com/install | sh
miss:
  - curl -fsSL -o install.sh https://get.example.sh
---
`curl ... | sh` executes the script before you or anyone has looked at it. A compromised or typo-squatted URL, or
a script that half-downloads, runs with your (or root's) rights.

For anything less than a well-known official installer: download first (`curl -fsSL -o install.sh URL`), skim it
(`less install.sh`), then run it.
