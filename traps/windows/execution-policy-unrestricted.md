---
id: execution-policy-unrestricted
title: Execution policy Unrestricted/Bypass for the whole machine is broader than you need
domain: windows
severity: medium
on: command
match: 'Set-ExecutionPolicy\s+(-ExecutionPolicy\s+)?(Unrestricted|Bypass)\b'
unless: '-Scope\s+Process'
hit:
  - Set-ExecutionPolicy Unrestricted
  - Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope LocalMachine
miss:
  - Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  - Set-ExecutionPolicy Bypass -Scope Process
---
Unrestricted/Bypass at machine scope lets any downloaded `.ps1` run without a prompt, for every user, permanently.

Usually enough: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` (your local scripts run, downloaded ones must be
signed or unblocked with `Unblock-File`), or `-Scope Process` for just this one window.
