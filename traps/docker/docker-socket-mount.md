---
id: docker-socket-mount
title: Mounting /var/run/docker.sock gives that container full root on the host
domain: docker
severity: medium
on: command
match: '/var/run/docker\.sock'
hit:
  - docker run -v /var/run/docker.sock:/var/run/docker.sock portainer/portainer-ce
miss:
  - docker run -v ./data:/data nginx
---
Whoever can talk to the Docker socket can start a privileged container that mounts `/` — that is root on the host.
Mounting it into a container means: if that container (or its web UI) is compromised, the whole server is.

Only do it for tools you trust and never expose their UI publicly without authentication. Read-only (`:ro`) does
**not** help — the API is still fully usable through a read-only socket mount.
