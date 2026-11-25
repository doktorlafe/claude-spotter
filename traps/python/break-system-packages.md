---
id: break-system-packages
title: --break-system-packages does what it says — use a virtual environment instead
domain: python
severity: medium
on: command
match: '--break-system-packages'
hit:
  - pip install --break-system-packages requests
miss:
  - pip install requests
---
This flag overrides the OS's protection of its own Python (PEP 668). Packages you install can replace versions that
system tools rely on; the breakage often shows up weeks later during an OS upgrade.

Create a venv for the project (`python3 -m venv .venv`) or use `pipx` for tools. It takes ten seconds and is undoable
by deleting a folder.
