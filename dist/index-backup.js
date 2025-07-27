#!/usr/bin/env node
import 'dotenv/config';
import { Server, StdioServerTransport } from '@modelcontextprotocol/sdk/server/index.js';
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
const server = new Server({
    name: 'mcp-discord-server',
    version: '0.1.0',
}, {
    capabilities: {
        tools: {},
    },
});
server.tool(listChannelsTool(dc, policy));
server.tool(fetchMessagesTool(dc, policy));
server.tool(postMessageTool(dc, policy, policy.allowedMentions()));
server.tool(replyMessageTool(dc, policy, policy.allowedMentions()));
server.tool(addReactionTool(dc, policy));
server.tool(deleteReactionTool(dc, policy));
server.tool(createThreadTool(dc, policy));
server.tool(listWebhooksTool(dc, policy));
server.tool(createWebhookTool(dc, policy));
server.tool(executeWebhookTool(dc));
server.tool(deleteWebhookTool(dc));
server.tool(listPinsTool(dc, policy));
server.tool(pinMessageTool(dc, policy));
server.tool(unpinMessageTool(dc, policy));
server.tool(bulkDeleteMessagesTool(dc, policy));
server.tool(listRolesTool(dc));
server.tool(createRoleTool(dc));
server.tool(deleteRoleTool(dc));
server.tool(createChannelTool(dc));
server.tool(editChannelTool(dc, policy));
server.tool(deleteChannelTool(dc, policy));
server.tool(getUserTool(dc));
server.tool(dmUserTool(dc));
server.tool(listCommandsTool(dc));
server.tool(upsertCommandTool(dc));
server.tool(deleteCommandTool(dc));
server.tool(setChannelPermissionTool(dc, policy));
server.tool(triggerTypingTool(dc, policy));
server.tool(rawRestTool(dc, Boolean(process.env.ENABLE_RAW_REST)));
server.tool(gatewaySubscribeTool(gw));
server.tool(gatewayGetEventsTool(gw));
server.tool(gatewayInfoTool(gw));
// Register generated tools
for (const t of generated)
    server.tool(t.handler);
// Helper tools
server.tool(searchToolsTool(docsIndex));
server.tool(helpTool(docsIndex));
server.tool(toolsIndexTool(docsIndex));
server.tool(listBansTool(dc));
server.tool(banUserTool(dc));
server.tool(unbanUserTool(dc));
server.tool(listEmojisTool(dc));
server.tool(createEmojiTool(dc));
server.tool(deleteEmojiTool(dc));
server.tool(listGuildStickersTool(dc));
server.tool(createGuildStickerTool(dc));
server.tool(deleteGuildStickerTool(dc));
server.tool(listScheduledEventsTool(dc));
server.tool(createScheduledEventTool(dc));
server.tool(deleteScheduledEventTool(dc));
server.tool(listPublicArchivedThreadsTool(dc, policy));
server.tool(listPrivateArchivedThreadsTool(dc, policy));
server.tool(listJoinedPrivateArchivedThreadsTool(dc, policy));
server.tool(createInviteTool(dc, policy));
server.tool(deleteInviteTool(dc));
server.tool(getMemberTool(dc));
server.tool(addMemberRoleTool(dc));
server.tool(removeMemberRoleTool(dc));
server.tool(kickMemberTool(dc));
server.tool(clearAllReactionsTool(dc, policy));
server.tool(removeUserReactionTool(dc, policy));
server.tool(postMessageWithFilesTool(dc, policy, policy.allowedMentions()));
const transport = new StdioServerTransport();
await server.connect(transport);
