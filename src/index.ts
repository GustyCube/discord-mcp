#!/usr/bin/env node
import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load .env from the project directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
config({ path: join(projectRoot, '.env') });
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { generateTools } from './generator.js';
import { searchToolsTool, helpTool, toolsIndexTool, type ToolDoc } from './tools/helpers.js';
import { listChannelsTool } from './tools/list_channels.js';
import { fetchMessagesTool } from './tools/fetch_messages.js';
import { listBansTool, banUserTool, unbanUserTool } from './tools/bans.js';
import { listEmojisTool, createEmojiTool, deleteEmojiTool } from './tools/emojis.js';
import { listGuildStickersTool, createGuildStickerTool, deleteGuildStickerTool } from './tools/stickers.js';
import { listScheduledEventsTool, createScheduledEventTool, deleteScheduledEventTool } from './tools/scheduled_events.js';
import { listPublicArchivedThreadsTool, listPrivateArchivedThreadsTool, listJoinedPrivateArchivedThreadsTool } from './tools/threads.js';
import { createInviteTool, deleteInviteTool } from './tools/invites.js';
import { getMemberTool, addMemberRoleTool, removeMemberRoleTool, kickMemberTool } from './tools/members.js';
import { clearAllReactionsTool, removeUserReactionTool } from './tools/reactions_more.js';
import { postMessageWithFilesTool } from './tools/files.js';

import { postMessageTool } from './tools/post_message.js';
import { replyMessageTool } from './tools/reply_message.js';
import { addReactionTool, deleteReactionTool } from './tools/reaction_tools.js';
import { createThreadTool } from './tools/create_thread.js';
import { listWebhooksTool, createWebhookTool, executeWebhookTool, deleteWebhookTool } from './tools/webhook_tools.js';
import { listPinsTool, pinMessageTool, unpinMessageTool } from './tools/pins.js';
import { bulkDeleteMessagesTool } from './tools/bulk_delete.js';
import { listRolesTool, createRoleTool, deleteRoleTool } from './tools/roles.js';
import { createChannelTool, editChannelTool, deleteChannelTool } from './tools/channels_admin.js';
import { getUserTool, dmUserTool } from './tools/users.js';
import { listCommandsTool, upsertCommandTool, deleteCommandTool } from './tools/interactions.js';
import { setChannelPermissionTool } from './tools/permissions.js';
import { triggerTypingTool } from './tools/typing.js';
import { rawRestTool } from './tools/raw_rest.js';
import { GatewayManager } from './gateway.js';
import { gatewaySubscribeTool, gatewayGetEventsTool, gatewayInfoTool } from './tools/gateway_tools.js';
import { DiscordClient } from './discord.js';
import { Policy } from './policy.js';
import type { ServerConfig } from './types.js';

function parseEnvList(v?: string): string[] | undefined {
  return v && v.trim().length ? v.split(',').map(s=>s.trim()) : undefined;
}

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('Missing DISCORD_BOT_TOKEN');
  process.exit(1);
}

const cfg: ServerConfig = {
  allow: {
    guildIds: parseEnvList(process.env.ALLOW_GUILD_IDS),
    channelIds: parseEnvList(process.env.ALLOW_CHANNEL_IDS),
  },
  defaultAllowedMentions: (process.env.ALLOWED_MENTIONS as any) || 'none'
};

const policy = new Policy(cfg);
const dc = new DiscordClient(token);

// Gateway setup
const intents = Number(process.env.GATEWAY_INTENTS ?? (1 << 0) /*Guilds*/ | (1 << 9) /*GuildMessages*/);
const gw = new GatewayManager(token, intents);
gw.start();

// Route generator: load catalog
import routes from './catalog/discord.routes.json' with { type: 'json' };

function parsePacksEnabled(){
  const packs = new Set<string>(['CORE']); // CORE always on
  if (process.env.PACK_ADMIN) packs.add('ADMIN');
  if (process.env.PACK_MEDIA) packs.add('MEDIA');
  if (process.env.PACK_COMMUNITY) packs.add('COMMUNITY');
  if (process.env.PACK_DEVTOOLS) packs.add('DEVTOOLS');
  return packs;
}

const packsEnabled = parsePacksEnabled();
const generated = generateTools(routes as any, dc, policy, { packsEnabled, defaultAllowedMentions: policy.allowedMentions() });

// Build an index for helpers
const docsIndex: ToolDoc[] = generated.map(g => ({
  name: g.entry.name,
  description: g.entry.description,
  aliases: g.entry.aliases,
  pack: g.entry.pack ?? 'CORE',
  path: g.entry.path,
  method: g.entry.method,
  example: undefined
}));

// MCP server
const server = new McpServer(
  {
    name: 'mcp-discord-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to register tools
function registerTool(toolHandler: any) {
  const { name, description, inputSchema, handler } = toolHandler;
  
  server.tool(
    name,
    description,
    inputSchema.shape,
    async (args: any) => {
      try {
        const result = handler({ input: args });
        const contents = [];
        
        for await (const output of result) {
          if (output.content) {
            contents.push(...output.content);
          }
        }
        
        return {
          content: contents
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: error.message || String(error)
          }]
        };
      }
    }
  );
}

// Register all tools (only those NOT in catalog)
registerTool(listChannelsTool(dc, policy)); // Custom implementation
// registerTool(fetchMessagesTool(dc, policy)); // Using generated version instead
// registerTool(postMessageTool(dc, policy, policy.allowedMentions())); // Using generated version instead
registerTool(replyMessageTool(dc, policy, policy.allowedMentions())); // Custom implementation
// registerTool(addReactionTool(dc, policy)); // Using generated version instead
registerTool(deleteReactionTool(dc, policy)); // Custom implementation (remove_my_reaction vs general delete)
// registerTool(createThreadTool(dc, policy)); // Using generated version instead
// registerTool(listWebhooksTool(dc, policy)); // Using generated version instead
// registerTool(createWebhookTool(dc, policy)); // Using generated version instead
registerTool(executeWebhookTool(dc)); // Custom implementation
// registerTool(deleteWebhookTool(dc)); // Using generated version instead
// registerTool(listPinsTool(dc, policy)); // Using generated version instead
// registerTool(pinMessageTool(dc, policy)); // Using generated version instead
// registerTool(unpinMessageTool(dc, policy)); // Using generated version instead
// registerTool(bulkDeleteMessagesTool(dc, policy)); // Using generated version instead
// registerTool(listRolesTool(dc)); // Using generated version instead
// registerTool(createRoleTool(dc)); // Using generated version instead
// registerTool(deleteRoleTool(dc)); // Using generated version instead
registerTool(createChannelTool(dc)); // Custom implementation
registerTool(editChannelTool(dc, policy)); // Custom implementation
registerTool(deleteChannelTool(dc, policy)); // Custom implementation
registerTool(getUserTool(dc)); // Custom implementation
registerTool(dmUserTool(dc)); // Custom implementation
// registerTool(listCommandsTool(dc)); // Using generated version instead
registerTool(upsertCommandTool(dc)); // Custom implementation
registerTool(deleteCommandTool(dc)); // Custom implementation
registerTool(setChannelPermissionTool(dc, policy)); // Custom implementation
// registerTool(triggerTypingTool(dc, policy)); // Using generated version instead
registerTool(rawRestTool(dc, Boolean(process.env.ENABLE_RAW_REST)));
registerTool(gatewaySubscribeTool(gw));
registerTool(gatewayGetEventsTool(gw));
registerTool(gatewayInfoTool(gw));

// Register generated tools
for (const t of generated) {
  registerTool(t.handler);
}

// Helper tools
registerTool(searchToolsTool(docsIndex));
registerTool(helpTool(docsIndex));
registerTool(toolsIndexTool(docsIndex));
registerTool(listBansTool(dc)); // Custom implementation
// registerTool(banUserTool(dc)); // Using generated version instead
// registerTool(unbanUserTool(dc)); // Using generated version instead

// registerTool(listEmojisTool(dc)); // Using generated version instead
registerTool(createEmojiTool(dc)); // Custom implementation
registerTool(deleteEmojiTool(dc)); // Custom implementation

registerTool(listGuildStickersTool(dc)); // Custom implementation
registerTool(createGuildStickerTool(dc)); // Custom implementation
registerTool(deleteGuildStickerTool(dc)); // Custom implementation

registerTool(listScheduledEventsTool(dc)); // Custom implementation
registerTool(createScheduledEventTool(dc)); // Custom implementation
registerTool(deleteScheduledEventTool(dc)); // Custom implementation

registerTool(listPublicArchivedThreadsTool(dc, policy)); // Custom implementation
registerTool(listPrivateArchivedThreadsTool(dc, policy)); // Custom implementation
registerTool(listJoinedPrivateArchivedThreadsTool(dc, policy)); // Custom implementation

// registerTool(createInviteTool(dc, policy)); // Using generated version instead
registerTool(deleteInviteTool(dc)); // Custom implementation

// registerTool(getMemberTool(dc)); // Using generated version instead
registerTool(addMemberRoleTool(dc)); // Custom implementation
registerTool(removeMemberRoleTool(dc)); // Custom implementation
// registerTool(kickMemberTool(dc)); // Using generated version instead

registerTool(clearAllReactionsTool(dc, policy));
registerTool(removeUserReactionTool(dc, policy));

registerTool(postMessageWithFilesTool(dc, policy, policy.allowedMentions()));

// Configure transport based on environment
const transportType = process.env.TRANSPORT || 'stdio';
const port = parseInt(process.env.PORT || '3000');

if (transportType === 'http') {
  // Create HTTP server for SSE transport
  const httpServer = createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/sse') {
      // Create transport for this connection
      const transport = new SSEServerTransport('/message', res);
      await transport.start();
      await server.connect(transport);
    } else if (req.method === 'POST' && req.url === '/message') {
      // Handle POST messages
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const parsedBody = JSON.parse(body);
          // This needs the specific transport instance for this connection
          // For now, return a simple response
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'received' }));
        } catch (error) {
          res.writeHead(400);
          res.end('Invalid JSON');
        }
      });
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  httpServer.listen(port, () => {
    console.error(`MCP Server running on http://localhost:${port}/sse`);
  });
} else {
  // Use stdio transport
  const transport = new StdioServerTransport();
  console.error('MCP Server running with stdio transport');
  await server.connect(transport);
}