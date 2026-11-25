---
id: systemd-daemon-reload
title: You edited a systemd unit but systemd is still using the old version
domain: linux
severity: low
on: output
match: 'changed on disk\. Run .systemctl daemon-reload'
hit:
  - "Warning: The unit file, source configuration file or drop-ins of myapp.service changed on disk. Run 'systemctl daemon-reload' to reload units."
miss:
  - "myapp.service: Succeeded."
---
systemd caches unit files. After editing `/etc/systemd/system/*.service` (or a drop-in), restarting the service
still uses the cached copy, so your change "doesn't work".

Run `sudo systemctl daemon-reload`, then `sudo systemctl restart <service>`, and check with
`systemctl status <service>` / `journalctl -u <service> -e`.
