---
id: irc-four-passwords
title: "IRC has four different passwords — and mixing them up is the classic beginner trap"
domain: irc
severity: medium
on: prompt
match: '\b(irc|ircd|inspircd|unrealircd|ergo|ngircd|znc|soju|weechat|hexchat|irssi|nickserv|libera\.chat)\b'
hit:
  - I want to run my own IRC server
  - jak nastavit nickserv v hexchat?
miss:
  - how do I set up a discord bot?
---
IRC passwords are separate things that clients and docs often call just "password":
1. **Server password** (`PASS`) — needed to connect at all, set in the server config; on public networks usually empty.
2. **NickServ / SASL password** — owns your registered nickname (account), set via `/msg NickServ REGISTER`.
3. **Oper password** — makes you an IRC operator, defined in the server's `oper` block, used with `/OPER`.
4. **Channel key** (`+k`) — needed to join one channel: `/join #chan key`.
A bouncer (ZNC, soju) adds a fifth: its own login, often sent through the server-password field as `user:pass`.

Other common pitfalls: use TLS on port 6697 (6667 is plaintext), and running a server exposes its IP — Cloudflare's
web proxy does not cover IRC.
