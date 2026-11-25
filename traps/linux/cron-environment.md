---
id: cron-environment
title: Cron runs with almost no environment — no PATH, no venv, different working directory
domain: linux
severity: low
on: command
match: '\bcrontab\b(?!\s+-l)'
hit:
  - crontab -e
  - crontab mycron.txt
miss:
  - crontab -l
---
A script that works in your terminal often fails silently in cron: PATH is minimal (`/usr/bin:/bin`), your shell
profile isn't loaded, the working directory is your home, and output goes nowhere.

Use absolute paths everywhere (`/home/me/app/.venv/bin/python /home/me/app/job.py`), `cd` explicitly, and capture
output: `... >> /home/me/job.log 2>&1`. Check it ran with `grep CRON /var/log/syslog` or `journalctl -u cron`.
