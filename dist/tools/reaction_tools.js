import { z } from 'zod';
export function addReactionTool(dc, policy) {
    const input = z.object({ channel_id: z.string(), message_id: z.string(), emoji: z.string() });
    return {
        name: 'discord.add_reaction',
        description: 'Add a reaction emoji to a message.',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id, message_id, emoji } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            await dc.addReaction(channel_id, message_id, emoji);
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
export function deleteReactionTool(dc, policy) {
    const input = z.object({ channel_id: z.string(), message_id: z.string(), emoji: z.string() });
    return {
        name: 'discord.delete_reaction',
        description: 'Remove your bot reaction from a message.',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id, message_id, emoji } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            await dc.deleteReaction(channel_id, message_id, emoji);
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
