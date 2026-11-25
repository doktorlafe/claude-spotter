---
id: rm-rf-unset-variable
title: rm -rf "$VAR/" becomes rm -rf / when the variable is empty
domain: linux
severity: high
on: command
match: '\brm\s+-\w*r\w*\s+[^;&|]*\$\{?[A-Za-z_]\w*\}?"?/'
unless: '\$\{\w+:\?'
hit:
  - rm -rf $BUILD_DIR/
  - rm -rf "${TARGET}/"*
miss:
  - rm -rf "${DIR:?}/"
  - rm -rf ./build
---
If the variable is unset or empty (a typo, a different shell, cron's empty environment), `rm -rf "$DIR/"` expands to
`rm -rf /`. This has wiped real servers and home directories.

Guard it: `rm -rf "${DIR:?}/"` aborts with an error when `DIR` is empty. In scripts, also use `set -u`.
