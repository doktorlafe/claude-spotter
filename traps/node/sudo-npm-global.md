---
id: sudo-npm-global
title: sudo npm install -g leaves root-owned files that cause permission errors later
domain: node
severity: medium
on: command
match: '\bsudo\s+(-\w+\s+)*npm\s+(i|install|add)\b.*(\s-g\b|--global)'
hit:
  - sudo npm install -g pm2
  - sudo npm i --global yarn
miss:
  - npm install -g pm2
  - npx create-vite@latest
---
Running npm as root creates root-owned files in npm's cache and global folder; later non-sudo commands fail with
`EACCES`, and install scripts of every package you install run as root.

Better: install Node through a version manager (nvm, fnm, volta) so globals live in your home directory, or set a
user prefix: `npm config set prefix ~/.npm-global` and add `~/.npm-global/bin` to PATH. Or just use `npx`.
