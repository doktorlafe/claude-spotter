---
id: port-already-in-use
title: Port already in use — find the process holding it instead of changing ports blindly
domain: linux
severity: low
on: output
match: 'EADDRINUSE|address already in use|port is already allocated'
hit:
  - "Error: listen EADDRINUSE: address already in use :::3000"
  - "Bind for 0.0.0.0:5432 failed: port is already allocated"
miss:
  - "Server listening on :3000"
---
Something is already listening on that port — very often an older copy of the same app still running in the
background, or a system service (a local Postgres installed earlier, Apache on 80).

Find it: `sudo ss -ltnp | grep :3000` (Linux), `lsof -i :3000` (macOS), `netstat -ano | findstr :3000` (Windows).
Then stop that process/service rather than piling up instances on new ports.
