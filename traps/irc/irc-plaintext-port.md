---
id: irc-plaintext-port
title: Port 6667 is plaintext IRC — passwords and messages travel unencrypted
domain: irc
severity: medium
on: command
match: '(\b(irssi|weechat|hexchat|ii|ncat|nc|telnet|ufw|firewall-cmd)\b.*\b6667\b|\b6667/tcp\b)'
hit:
  - irssi -c irc.libera.chat -p 6667
  - sudo ufw allow 6667/tcp
miss:
  - sudo ufw allow 6697/tcp
---
6667 is the traditional unencrypted IRC port: your NickServ password, oper password and private messages can be read
on the network path.

Use TLS on 6697 (`irssi -c irc.libera.chat -p 6697 -tls`, `/server add -ssl` in WeeChat), and on your own server open
only 6697 with a real certificate (Let's Encrypt).
