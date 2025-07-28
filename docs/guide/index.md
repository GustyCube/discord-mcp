# Getting Started Guide

Welcome to Discord MCP! This guide will help you set up and start using the Discord Model Context Protocol server.

## Prerequisites

- Node.js >= 20.11.0
- A Discord Bot Token ([Create one here](https://discord.com/developers/applications))
- Claude Desktop or another MCP-compatible client

## Installation

1. Clone the repository:
```bash
git clone https://github.com/bennettschwartz/discord-mcp.git
cd discord-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

Create a `.env` file from the example:
```bash
cp .env.example .env
```

Edit `.env` with your Discord bot token:
```env
DISCORD_BOT_TOKEN=your_bot_token_here
```

For more detailed configuration options, see the [Configuration Guide](/configuration).

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Next Steps

- Learn about [Tool Packs](/packs) to enable additional features
- Explore [Examples](/examples) of common use cases
- Understand the [Security Model](/security) for safe operation
- Set up [Gateway Events](/gateway) for real-time Discord data