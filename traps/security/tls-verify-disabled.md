---
id: tls-verify-disabled
title: Code that disables certificate checks tends to reach production
domain: security
severity: medium
on: file
path: '\.(py|js|mjs|cjs|ts|go|rb|php)$'
match: '(verify\s*=\s*False|rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED|InsecureSkipVerify\s*:\s*true|CURLOPT_SSL_VERIFYPEER\W+(false|0))'
hit:
  - client.py ::: requests.get(url, verify=False)
  - "api.ts ::: new https.Agent({ rejectUnauthorized: false })"
miss:
  - client.py ::: requests.get(url, timeout=10)
---
Disabling certificate verification "just for testing" is one of the most common ways man-in-the-middle bugs ship.

Point the client at the right CA instead (`verify="/path/ca.pem"`, `ca: fs.readFileSync(...)`) or fix the server's
certificate. If it must stay for local dev, guard it behind an explicit env flag that defaults to secure.
