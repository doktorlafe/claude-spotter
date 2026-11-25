---
id: dev-server-all-interfaces
title: Binding a dev server to 0.0.0.0 exposes it to your whole network (or the internet on a VPS)
domain: network
severity: low
on: command
match: '(--host(=|\s+)0\.0\.0\.0|--bind(=|\s+)0\.0\.0\.0|\s-b\s+0\.0\.0\.0|runserver\s+0\.0\.0\.0)'
hit:
  - npm run dev -- --host 0.0.0.0
  - python manage.py runserver 0.0.0.0:8000
miss:
  - npm run dev
  - flask run --host 127.0.0.1
---
`0.0.0.0` means "every network interface". On a laptop that is everyone on the café Wi-Fi; on a VPS it is the
internet. Dev servers have debug pages, no auth and auto-reload — not meant to be public.

Use `127.0.0.1` unless another device must reach it. To test from your phone, keep it on a trusted network; to
share it, use a tunnel with auth or deploy behind a real web server.
