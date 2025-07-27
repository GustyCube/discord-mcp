import { z } from 'zod';
import { Routes } from 'discord-api-types/v10';
export function clearAllReactionsTool(dc, policy) {
    const input = z.object({ channel_id: z.string(), message_id: z.string() });
    return {
        name: 'discord.clear_all_reactions',
        description: 'Remove all reactions from a message.',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id, message_id } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            const rest = dc['rest'];
            await rest.delete(Routes.channelMessageAllReactions(channel_id, message_id));
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
export function removeUserReactionTool(dc, policy) {
    const input = z.object({ channel_id: z.string(), message_id: z.string(), emoji: z.string(), user_id: z.string() });
    return {
        name: 'discord.remove_user_reaction',
        description: 'Remove a specific user’s reaction emoji (requires perms).',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id, message_id, emoji, user_id } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            const rest = dc['rest'];
            await rest.delete(Routes.channelMessageReaction(channel_id, message_id, emoji) + '/' + user_id);
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
