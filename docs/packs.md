# Packs

- `CORE` — messages, reactions, pins, basic threads, typing
- `ADMIN` — roles, members, bans, audit log, automod, guild modify
- `MEDIA` — emojis, stickers, attachments
- `COMMUNITY` — invites, scheduled events, stage instances, news follow, threads
- `DEVTOOLS` — webhooks, commands, current user/app, voice regions

Enable by setting an env var to any non-empty value.


## Extra packs

- `EXPERIMENTAL` — Undocumented or unstable endpoints (e.g., *soundboard*). Disabled by default.
- `OAUTH_ONLY` — Endpoints that require a user **OAuth bearer** token (e.g., command permissions V2). Not usable with bot tokens; left off by default.

Enable by setting the env var to any non-empty value.
