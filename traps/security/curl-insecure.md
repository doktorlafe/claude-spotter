---
id: curl-insecure
title: Turning off TLS verification makes the connection open to interception
domain: security
severity: medium
on: command
match: '(\bcurl\b[^|]*\s(-k|--insecure)\b|NODE_TLS_REJECT_UNAUTHORIZED=0|GIT_SSL_NO_VERIFY|http\.sslVerify\s+false)'
hit:
  - curl -k https://api.example.com
  - git config --global http.sslVerify false
miss:
  - curl -fsSL https://api.example.com
---
These flags make the "certificate error" go away by no longer checking who you are talking to. Anyone on the network
path can then read and modify the traffic, including passwords and tokens — and the global git setting applies to
every repo, forever.

Fix the cause instead: a self-signed cert → trust it explicitly (`curl --cacert ca.pem`); a corporate proxy → install
its CA; an expired cert → renew it (e.g. `certbot renew`).
