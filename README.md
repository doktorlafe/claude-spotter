# 🛟 Spotter

**Spotter stops you one second before you step into a trap only experience would warn you about.**

AI lets you build things far outside what you already know. That's the magic, and also the problem: AI answers the
question you *ask*. It rarely warns you about the thing you didn't know to ask about.

Spotter is a [Claude Code](https://claude.com/claude-code) plugin that watches what's about to happen (the command,
the file being written, the error that just appeared) and speaks up **only** when it matches a known trap. Then it
gives you one line and the better way.

```text
> run postgres in docker so my app can use it

● Bash(docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=secret postgres)
  🛟 Spotter: Docker-published ports bypass your firewall (ufw/firewalld) and are open to the internet

● Spotter caught something worth knowing: Docker writes its own iptables rules, so ufw won't protect
  port 5432 and anyone on the internet could reach your database. Since only your app needs it,
  I'll bind it to localhost instead:

● Bash(docker run -d -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=secret postgres)
  ✓ done
```

No AI calls, no tokens, no telemetry. Just a curated library of traps, matched locally in about 0.1 seconds.

## Install

In Claude Code:

```text
/plugin marketplace add doktorlafe/spotter
/plugin install spotter@spotter
```

That's it. Start a new session and keep building.

## Traps it knows (36 so far)

A few that have bitten real people:

| | Trap |
|---|---|
| 🐳 | `docker run -p 5432:5432` **bypasses ufw**: your database is on the internet |
| 💣 | `rm -rf "$DIR/"` becomes `rm -rf /` when `DIR` is empty |
| 🔑 | `git add .env`: once it's pushed, the secret is leaked, and deleting the commit doesn't help |
| 🔒 | `sudo ufw enable` over SSH without allowing SSH first **locks you out** |
| ☁️ | Cloudflare's orange cloud **doesn't hide your IP** for IRC, SSH, game servers… |
| 🐍 | `externally-managed-environment`: use a venv, not `--break-system-packages` |
| 💬 | IRC has **four different passwords**, and everyone mixes them up |

Domains: Docker, Linux, Python, Node, git, networking, security, IRC, Windows. Run `/spotter:spotter list` to see them all.

## How it decides when to speak

Spotter is only useful if it stays quiet most of the time:

- **Each trap speaks at most once per session.**
- **At most 3 warnings per session** (`SPOTTER_MAX`).
- **Serious traps (high/medium) pause the command once.** Claude reads why *before* anything runs and usually
  switches to the safer way. If the original was right after all, it runs it again and Spotter lets it through.
- **Low-severity traps just add a note.** Nothing is blocked.
- **Mute anything:** `/spotter:spotter mute <trap-id>`.

Hooks: prompts (the topic you're starting on), commands before they run, files before they're written, and error
output after a command.

| Setting (env var) | Effect |
|---|---|
| `SPOTTER_MODE=soft` | never pause commands, only add notes |
| `SPOTTER_MODE=off` | disable Spotter |
| `SPOTTER_MAX=5` | warnings per session (default 3) |

`/spotter:spotter stats` shows how many times Spotter caught you.

## Add a trap: it's one file

You know a trap that cost you an evening? That's exactly what belongs here. Each trap is a small Markdown file with a
regex and a few sentences of advice. See [CONTRIBUTING.md](CONTRIBUTING.md). It takes about five minutes, and CI tests
your examples automatically.

## License

MIT
