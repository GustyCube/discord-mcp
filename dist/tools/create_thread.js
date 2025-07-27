import { z } from 'zod';
export function createThreadTool(dc, policy) {
    const input = z.object({
        channel_id: z.string(),
        name: z.string().max(100),
        message_id: z.string().optional()
    });
    return {
        name: 'discord.create_thread',
        description: 'Create a thread in a channel; optionally from an existing message.',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id, name, message_id } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            const body = { name };
            if (message_id)
                body.message_id = message_id;
            const thread = await dc.createThread(channel_id, body);
            yield { content: [{ type: 'json', text: JSON.stringify(thread) }] };
        }
    };
}
