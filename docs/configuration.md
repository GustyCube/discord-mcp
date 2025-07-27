# Configuration

Copy `.env.example` to `.env` and set:

- `DISCORD_BOT_TOKEN` — bot token
- `ALLOW_GUILD_IDS` — comma-separated allow-list (recommended)
- `ALLOW_CHANNEL_IDS` — comma-separated allow-list (recommended)
- `ALLOWED_MENTIONS` — `none|users|roles|everyone` (default: `none`)
- `GATEWAY_INTENTS` — bitfield; enable MESSAGE_CONTENT only if approved
- Packs: `PACK_ADMIN`, `PACK_MEDIA`, `PACK_COMMUNITY`, `PACK_DEVTOOLS`
- Optional: `ENABLE_RAW_REST` — enables whitelisted raw REST escape hatch

Build/run:
```bash
npm run build
npm start
```
