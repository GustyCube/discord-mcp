import { z } from 'zod';
export function fetchMessagesTool(dc, policy) {
    const input = z.object({
        channel_id: z.string(),
        limit: z.number().int().min(1).max(100).default(50),
        before: z.string().optional(),
        after: z.string().optional()
    });
    return {
        name: 'discord.fetch_messages',
        description: 'Fetch recent messages in a channel (paginated).',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id, limit, before, after } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            const msgs = await dc.fetchMessages(channel_id, { limit, before, after });
            yield { content: [{ type: 'json', text: JSON.stringify(msgs) }] };
        }
    };
}
