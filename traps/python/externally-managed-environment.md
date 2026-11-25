---
id: externally-managed-environment
title: "externally-managed-environment: your OS protects its Python — use a venv, not --break-system-packages"
domain: python
severity: low
on: output
match: 'externally-managed-environment'
hit:
  - "error: externally-managed-environment"
miss:
  - "Successfully installed requests-2.32.3"
---
Newer Debian/Ubuntu/Fedora mark the system Python as managed by the OS (PEP 668), so `pip install` outside a virtual
environment is refused. The error suggests `--break-system-packages` — that flag is named honestly.

Do: `python3 -m venv .venv`, then `. .venv/bin/activate` (Windows: `.venv\Scripts\activate`) and `pip install ...`.
For CLI tools: `pipx install <tool>`. For OS-wide libraries: `sudo apt install python3-<name>`.
