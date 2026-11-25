---
id: chmod-777
title: chmod 777 lets every user and process on the machine modify (and run) these files
domain: linux
severity: medium
on: command
match: '\bchmod\s+(-\w+\s+)*0?777\b'
hit:
  - chmod -R 777 /var/www
  - sudo chmod 777 app.sock
miss:
  - chmod 755 deploy.sh
  - chmod -R u+rwX storage
---
777 "fixes" permission errors by removing permissions entirely. Any compromised service (a web app, a plugin) can then
rewrite your code or plant scripts that run later.

Find out *who* needs access instead: `ls -l` shows owner/group; usually the fix is `chown -R www-data:www-data dir`
(or your service user) with `755` for directories and `644` for files, or adding your user to the right group.
