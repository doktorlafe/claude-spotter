---
id: module-not-found-interpreter
title: "\"No module named X\" right after installing X usually means two different Pythons"
domain: python
severity: low
on: output
match: 'ModuleNotFoundError: No module named'
hit:
  - "ModuleNotFoundError: No module named 'requests'"
miss:
  - "ImportError: cannot import name 'foo' from 'bar'"
---
Very often the package *is* installed — into a different interpreter or venv than the one running your code
(`pip` and `python` point to different installs, the venv isn't activated, or an IDE/cron uses system Python).

Check: `python -c "import sys; print(sys.executable)"` vs `pip -V`. Install with the interpreter that runs the code:
`python -m pip install requests`.
