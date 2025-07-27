import { z } from 'zod';
import { Routes } from 'discord-api-types/v10';
export function bulkDeleteMessagesTool(dc, policy) {
    const input = z.object({ channel_id: z.string(), message_ids: z.array(z.string()).min(2).max(100) });
    return {
        name: 'discord.bulk_delete_messages',
        description: 'Bulk delete 2-100 messages (must be <14 days old).',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id, message_ids } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            const rest = dc['rest'];
            await rest.post(Routes.channelBulkDelete(channel_id), { body: { messages: message_ids } });
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
