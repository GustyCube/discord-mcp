---
layout: home

hero:
  name: Discord MCP
  text: Model Context Protocol for Discord
  tagline: Safe, declarative Discord API access through MCP tools
  actions:
    - theme: brand
      text: Get Started
      link: /configuration
    - theme: alt
      text: View on GitHub
      link: https://github.com/bennettschwartz/discord-mcp

features:
  - icon: 🚀
    title: Route Generator
    details: Declarative catalog automatically generates tools with names, descriptions, and JSON schemas from Discord API routes
  - icon: 🔌
    title: Gateway Events
    details: Real-time Discord events with queue management and filtering capabilities
  - icon: 🔒
    title: Built-in Safety
    details: Guild/channel allow-lists, human-in-the-loop confirmations, and safe mention defaults
  - icon: 📦
    title: Modular Packs
    details: Enable only the features you need - CORE, ADMIN, MEDIA, COMMUNITY, and DEVTOOLS packs
---

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Enable desired packs
echo "PACK_ADMIN=1" >> .env
echo "PACK_MEDIA=1" >> .env
echo "PACK_COMMUNITY=1" >> .env
echo "PACK_DEVTOOLS=1" >> .env

# Run in development mode
npm run dev
```

## Claude Desktop Configuration

Add to your `mcp.json`:

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