import { z } from 'zod';
import { Routes, OverwriteType } from 'discord-api-types/v10';
export function setChannelPermissionTool(dc, policy) {
    const input = z.object({
        channel_id: z.string(),
        overwrite_id: z.string(),
        type: z.number().default(OverwriteType.Role),
        allow: z.string().default('0'),
        deny: z.string().default('0')
    });
    return {
        name: 'discord.set_channel_permission',
        description: 'Set a permission overwrite on a channel (be careful).',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id, overwrite_id, type, allow, deny } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            const rest = dc['rest'];
            await rest.put(Routes.channelPermission(channel_id, overwrite_id), { body: { type, allow, deny } });
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
