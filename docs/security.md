# Security Model

- **Least privilege:** restrict bot permissions & intents.
- **Allow-lists:** `ALLOW_GUILD_IDS`/`ALLOW_CHANNEL_IDS` enforced server-side.
- **Human-in-the-loop:** destructive/high-impact tools have `confirm=true`.
- **Mentions sanitized:** default allowed mentions is `none`.
- **Webhook tokens:** creation redacts tokens; execution requires explicit token.
- **Audit & logs:** log tool inputs/outputs server-side (add persistence as needed).
