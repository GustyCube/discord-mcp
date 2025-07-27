#!/usr/bin/env node
import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { generateTools } from './generator.js';
import { searchToolsTool, helpTool, toolsIndexTool } from './tools/helpers.js';
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
import { bulkDeleteMessagesTool } from './tools/bulk_delete.ts';
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
function parseEnvList(v) {
    return v && v.trim().length ? v.split(',').map(s => s.trim()) : undefined;
}
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
    console.error('Missing DISCORD_BOT_TOKEN');
    process.exit(1);
}
const cfg = {
    allow: {
        guildIds: parseEnvList(process.env.ALLOW_GUILD_IDS),
        channelIds: parseEnvList(process.env.ALLOW_CHANNEL_IDS),
    },
    defaultAllowedMentions: process.env.ALLOWED_MENTIONS || 'none'
};
const policy = new Policy(cfg);
const dc = new DiscordClient(token);
// Gateway setup
const intents = Number(process.env.GATEWAY_INTENTS ?? (1 << 0) /*Guilds*/ | (1 << 9) /*GuildMessages*/);
const gw = new GatewayManager(token, intents);
gw.start();
// Route generator: load catalog
import routes from './catalog/discord.routes.json' with { type: 'json' };
function parsePacksEnabled() {
    const packs = new Set(['CORE']); // CORE always on
    if (process.env.PACK_ADMIN)
        packs.add('ADMIN');
    if (process.env.PACK_MEDIA)
        packs.add('MEDIA');
    if (process.env.PACK_COMMUNITY)
        packs.add('COMMUNITY');
    if (process.env.PACK_DEVTOOLS)
        packs.add('DEVTOOLS');
    return packs;
}
const packsEnabled = parsePacksEnabled();
const generated = generateTools(routes, dc, policy, { packsEnabled, defaultAllowedMentions: policy.allowedMentions() });
// Build an index for helpers
const docsIndex = generated.map(g => ({
    name: g.entry.name,
    description: g.entry.description,
    aliases: g.entry.aliases,
    pack: g.entry.pack ?? 'CORE',
    path: g.entry.path,
    method: g.entry.method,
    example: undefined
}));
// MCP server
const server = new McpServer({
    name: 'mcp-discord-server',
    version: '0.1.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Helper function to register tools
function registerTool(toolHandler) {
    const { name, description, inputSchema, handler } = toolHandler;
    server.tool(name, description, inputSchema.shape, async (args) => {
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
    });
}
// Register all tools
registerTool(listChannelsTool(dc, policy));
registerTool(fetchMessagesTool(dc, policy));
registerTool(postMessageTool(dc, policy, policy.allowedMentions()));
registerTool(replyMessageTool(dc, policy, policy.allowedMentions()));
registerTool(addReactionTool(dc, policy));
registerTool(deleteReactionTool(dc, policy));
registerTool(createThreadTool(dc, policy));
registerTool(listWebhooksTool(dc, policy));
registerTool(createWebhookTool(dc, policy));
registerTool(executeWebhookTool(dc));
registerTool(deleteWebhookTool(dc));
registerTool(listPinsTool(dc, policy));
registerTool(pinMessageTool(dc, policy));
registerTool(unpinMessageTool(dc, policy));
registerTool(bulkDeleteMessagesTool(dc, policy));
registerTool(listRolesTool(dc));
registerTool(createRoleTool(dc));
registerTool(deleteRoleTool(dc));
registerTool(createChannelTool(dc));
registerTool(editChannelTool(dc, policy));
registerTool(deleteChannelTool(dc, policy));
registerTool(getUserTool(dc));
registerTool(dmUserTool(dc));
registerTool(listCommandsTool(dc));
registerTool(upsertCommandTool(dc));
registerTool(deleteCommandTool(dc));
registerTool(setChannelPermissionTool(dc, policy));
registerTool(triggerTypingTool(dc, policy));
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
registerTool(listBansTool(dc));
registerTool(banUserTool(dc));
registerTool(unbanUserTool(dc));
registerTool(listEmojisTool(dc));
registerTool(createEmojiTool(dc));
registerTool(deleteEmojiTool(dc));
registerTool(listGuildStickersTool(dc));
registerTool(createGuildStickerTool(dc));
registerTool(deleteGuildStickerTool(dc));
registerTool(listScheduledEventsTool(dc));
registerTool(createScheduledEventTool(dc));
registerTool(deleteScheduledEventTool(dc));
registerTool(listPublicArchivedThreadsTool(dc, policy));
registerTool(listPrivateArchivedThreadsTool(dc, policy));
registerTool(listJoinedPrivateArchivedThreadsTool(dc, policy));
registerTool(createInviteTool(dc, policy));
registerTool(deleteInviteTool(dc));
registerTool(getMemberTool(dc));
registerTool(addMemberRoleTool(dc));
registerTool(removeMemberRoleTool(dc));
registerTool(kickMemberTool(dc));
registerTool(clearAllReactionsTool(dc, policy));
registerTool(removeUserReactionTool(dc, policy));
registerTool(postMessageWithFilesTool(dc, policy, policy.allowedMentions()));
const transport = new StdioServerTransport();
await server.connect(transport);
