# discord-mcp

Private repo for a **Model Context Protocol** server that exposes Discord APIs (REST + Gateway) as safe MCP tools.

- **Route generator:** declarative catalog → tools with names, descriptions, JSON schemas.
- **Gateway events:** queue with subscribe/get/info tools.
- **Safety:** guild/channel allow-lists, human-in-the-loop confirmations, allowed mentions = none by default.
- **Packs:** CORE (always), ADMIN, MEDIA, COMMUNITY, DEVTOOLS.

## Quick start

```bash
npm i
cp .env.example .env
# enable packs if desired
echo "PACK_ADMIN=1" >> .env
echo "PACK_MEDIA=1" >> .env
echo "PACK_COMMUNITY=1" >> .env
echo "PACK_DEVTOOLS=1" >> .env

npm run dev  # stdio transport
```

### Example: Claude Desktop `mcp.json`
```json
{
  "mcpServers": {
    "discord": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "DISCORD_BOT_TOKEN": "****",
        "ALLOW_GUILD_IDS": "123,456",
        "ALLOW_CHANNEL_IDS": "789,012",
        "ALLOWED_MENTIONS": "none",
        "GATEWAY_INTENTS": "1<<0|1<<9",
        "PACK_ADMIN": "1",
        "PACK_MEDIA": "1",
        "PACK_COMMUNITY": "1",
        "PACK_DEVTOOLS": "1"
      }
    }
  }
}
```

## Documentation

- [Configuration](docs/configuration.md)
- [Route Generator](docs/route-generator.md)
- [Gateway Events](docs/gateway.md)
- [Security Model](docs/security.md)
- [Tooling & Packs](docs/packs.md)
- [Troubleshooting](docs/troubleshooting.md)
- [FAQ](docs/faq.md)

## License

MIT (see `LICENSE`). For now this repo is **private**.


See **[Examples](docs/examples.md)** for common MCP tool calls.


> Packs also include **EXPERIMENTAL** (unstable/undocumented) and **OAUTH_ONLY** (requires user OAuth bearer; not usable with bot tokens).
