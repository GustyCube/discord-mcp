# Gateway Events

Uses `@discordjs/ws`. Set intents with `GATEWAY_INTENTS`. Defaults to Guilds|GuildMessages.

Tools:
- `discord.gateway_subscribe(event_types?, guild_ids?, channel_ids?)`
- `discord.gateway_get_events(max=50)`
- `discord.gateway_info()`

Pattern: subscribe filters → poll `gateway_get_events`.
