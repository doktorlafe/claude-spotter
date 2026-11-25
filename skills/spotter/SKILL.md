---
name: spotter
description: List Spotter's traps, show how many times Spotter caught the user, or mute/unmute a trap. Use when the user types /spotter or asks about Spotter warnings, stats, or silencing one.
argument-hint: "list | stats | mute <id> | unmute <id>"
disable-model-invocation: true
---

Spotter output:

!`node "${CLAUDE_PLUGIN_ROOT}/hooks/spotter.mjs" --cli $ARGUMENTS`

Show the output above to the user as-is (it is short), in a code block, and reply in the user's language.
If they asked to mute a trap but gave no id, show `list` and ask which one. Mention once that
`SPOTTER_MODE=soft` (never pause commands) and `SPOTTER_MAX=<n>` (warnings per session, default 3) can be set as
environment variables, and `SPOTTER_MODE=off` disables Spotter.
