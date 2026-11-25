---
id: database-exposed
title: This database config listens on all interfaces — bots find open databases within minutes
domain: security
severity: high
on: file
path: '(redis\.conf|mongod\.conf|postgresql\.conf|my\.cnf|mysqld\.cnf)$'
match: '^\s*(bind\s+0\.0\.0\.0|bindIp:\s*0\.0\.0\.0|listen_addresses\s*=\s*''\*''|bind-address\s*=\s*0\.0\.0\.0|protected-mode\s+no)'
flags: im
hit:
  - /etc/redis/redis.conf ::: bind 0.0.0.0
  - /etc/postgresql/16/main/postgresql.conf ::: listen_addresses = '*'
miss:
  - /etc/redis/redis.conf ::: bind 127.0.0.1 -::1
---
Exposed Redis, MongoDB, Postgres and MySQL instances are among the most scanned targets on the internet: data gets
dumped or ransomed, and open Redis is a classic route to running code on the server.

Keep it on `127.0.0.1` and connect remotely through an SSH tunnel (`ssh -L 5432:localhost:5432 server`) or a private
network/VPN. If it must listen publicly: strong auth, TLS, and a firewall allow-list of specific IPs.
