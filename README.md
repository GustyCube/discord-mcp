# Discord MCP Server

A **Model Context Protocol** server that provides AI agents with secure access to Discord's REST API and Gateway events.

<a href="https://glama.ai/mcp/servers/@GustyCube/discord-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@GustyCube/discord-mcp/badge" alt="Discord Server MCP server" />
</a>

## Features

🔧 **120+ Discord API Tools** - Complete coverage of Discord's REST API  
🔒 **Security First** - Guild/channel allowlists, safe defaults, no accidental mentions  
⚡ **Real-time Events** - Gateway integration for live Discord activity  
🎯 **Smart Routing** - Auto-generated tools from declarative API catalog  
📦 **Modular Packs** - Enable only the functionality you need  

## Quick Start

```bash
# Clone and install
git clone https://github.com/GustyCube/discord-mcp
cd discord-mcp
npm install

# Configure your bot
cp .env.example .env
# Add your DISCORD_BOT_TOKEN and other settings

# Build and run
npm run build
npm start
```

## Documentation

📖 **Complete documentation available at [discord-mcp.gustycube.com](https://discord-mcp.gustycube.com/)**

### Quick Links
- [Getting Started](https://discord-mcp.gustycube.com/getting-started)
- [Configuration](https://discord-mcp.gustycube.com/configuration) 
- [Available Tools](https://discord-mcp.gustycube.com/tools)
- [Security Model](https://discord-mcp.gustycube.com/security)
- [Examples](https://discord-mcp.gustycube.com/examples)

## Example: Claude Desktop Integration

Add to your `mcp.json`:

```json
{
  "mcpServers": {
    "discord": {
      "command": "node",
      "args": ["/path/to/discord-mcp/dist/index.js"],
      "env": {
        "DISCORD_BOT_TOKEN": "your_bot_token_here",
        "ALLOW_GUILD_IDS": "123456789,987654321",
        "ALLOW_CHANNEL_IDS": "111111111,222222222"
      }
    }
  }
}
```

## What You Can Do

- **📝 Message Management** - Send, edit, delete messages and reactions
- **👥 User & Guild Info** - Get user profiles, guild details, member lists  
- **🔊 Channel Operations** - List channels, manage permissions, create threads
- **🎭 Rich Content** - Send embeds, manage webhooks, upload files
- **⚡ Live Events** - Subscribe to message events, member joins, etc.
- **🛡️ Moderation** - Manage bans, kicks, roles (with appropriate permissions)

## Contributing

See the [full documentation](https://discord-mcp.gustycube.com/) for development setup, API reference, and contribution guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details.