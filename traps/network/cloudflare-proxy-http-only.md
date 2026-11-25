---
id: cloudflare-proxy-http-only
title: Cloudflare's orange-cloud proxy only covers web traffic (HTTP/HTTPS)
domain: network
severity: medium
on: prompt
match: 'cloudflare.{0,100}\b(irc|ssh|minecraft|smtp|mail|tcp|udp|game ?server|postgres|mysql|database|vpn|wireguard)\b|\b(irc|ssh|minecraft|smtp|tcp|udp|postgres|mysql|wireguard)\b.{0,100}cloudflare'
hit:
  - I want to hide my server IP behind cloudflare for my IRC server
  - can cloudflare protect my minecraft server?
miss:
  - set up cloudflare for my wordpress site
---
The proxied ("orange cloud") DNS record only forwards HTTP/HTTPS on specific ports. For IRC, SSH, game servers,
mail or databases the record is either DNS-only — which publishes your real IP — or the connection simply fails.

Options: Cloudflare Tunnel (`cloudflared`; clients may need `cloudflared access` for raw TCP), Cloudflare Spectrum
(paid), or a cheap VPS/relay in front. Also check that the real IP doesn't leak elsewhere: old DNS records, mail
headers, other subdomains on the same IP.
