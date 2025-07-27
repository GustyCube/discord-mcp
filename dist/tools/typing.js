import { z } from 'zod';
import { Routes } from 'discord-api-types/v10';
export function triggerTypingTool(dc, policy) {
    const input = z.object({ channel_id: z.string() });
    return {
        name: 'discord.trigger_typing',
        description: 'Trigger typing indicator in a channel.',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            const rest = dc['rest'];
            await rest.post(Routes.channelTyping(channel_id), {});
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
