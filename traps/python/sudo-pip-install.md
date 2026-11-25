---
id: sudo-pip-install
title: sudo pip install mixes packages into the system Python and can break OS tools
domain: python
severity: medium
on: command
match: '\bsudo\s+(-\w+\s+)*(pip3?|python3?\s+-m\s+pip)\s+install\b'
hit:
  - sudo pip install requests
  - sudo python3 -m pip install flask
miss:
  - pip install requests
  - .venv/bin/pip install flask
---
The system Python belongs to your OS — apt, cloud-init and other tools depend on its packages. Overwriting them as
root can break those tools in confusing ways, and you end up with files apt doesn't know about.

Use a virtual environment per project: `python3 -m venv .venv && . .venv/bin/activate && pip install requests`.
For command-line tools, `pipx install <tool>`.
