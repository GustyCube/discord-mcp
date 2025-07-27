# Troubleshooting

**429s / Rate limits**
- `@discordjs/rest` respects per-route buckets. Back off and retry.

**403s / Missing permissions**
- Check guild/channel permissions for the bot.
- Some endpoints require privileged intents or elevated scopes.

**No messages returned**
- Likely missing `MESSAGE_CONTENT` intent. Only request if approved by Discord.

**Gateway missing events**
- Check `GATEWAY_INTENTS`. Ensure filters in `gateway_subscribe` are correct.
