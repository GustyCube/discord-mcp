import { z } from 'zod';
import { Routes } from 'discord-api-types/v10';
export function listBansTool(dc) {
    const input = z.object({ guild_id: z.string(), limit: z.number().int().min(1).max(1000).optional(), before: z.string().optional(), after: z.string().optional() });
    return {
        name: 'discord.list_bans',
        description: 'List bans in a guild (paginated).',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, limit, before, after } = input;
            const rest = dc['rest'];
            const queryParams = new URLSearchParams();
            if (limit)
                queryParams.set('limit', limit.toString());
            if (before)
                queryParams.set('before', before);
            if (after)
                queryParams.set('after', after);
            const res = await rest.get(Routes.guildBans(guild_id) + (queryParams.toString() ? `?${queryParams.toString()}` : ''));
            yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
        }
    };
}
export function banUserTool(dc) {
    const input = z.object({ guild_id: z.string(), user_id: z.string(), delete_message_seconds: z.number().int().min(0).max(604800).default(0), reason: z.string().max(512).optional() });
    return {
        name: 'discord.ban_user',
        description: 'Ban a user from a guild.',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, user_id, delete_message_seconds, reason } = input;
            const rest = dc['rest'];
            await rest.put(Routes.guildBan(guild_id, user_id), { body: { delete_message_seconds }, reason });
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
export function unbanUserTool(dc) {
    const input = z.object({ guild_id: z.string(), user_id: z.string(), reason: z.string().optional() });
    return {
        name: 'discord.unban_user',
        description: 'Remove a ban from a user in a guild.',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, user_id, reason } = input;
            const rest = dc['rest'];
            await rest.delete(Routes.guildBan(guild_id, user_id), { reason });
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
