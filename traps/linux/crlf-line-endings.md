---
id: crlf-line-endings
title: Windows line endings (CRLF) in a shell script — Linux reads the \r as part of the command
domain: linux
severity: low
on: output
match: '\$''\\r'': command not found|\^M: bad interpreter|\\r: No such file or directory'
hit:
  - ./deploy.sh: line 2: $'\r': command not found
  - "bash: ./run.sh: /bin/bash^M: bad interpreter: No such file or directory"
miss:
  - "bash: foo: command not found"
---
The file was saved on Windows (or checked out by git with `autocrlf`), so every line ends with `\r\n`. Bash sees
the invisible `\r` as part of each command.

Fix the file: `sed -i 's/\r$//' script.sh` (or `dos2unix`). Prevent it: add `*.sh text eol=lf` to `.gitattributes`
and set your editor to LF for scripts.
