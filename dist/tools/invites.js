import { z } from 'zod';
import { Routes } from 'discord-api-types/v10';
export function createInviteTool(dc, policy) {
    const input = z.object({ channel_id: z.string(), max_age: z.number().int().min(0).max(604800).default(86400), max_uses: z.number().int().min(0).max(100).default(0), temporary: z.boolean().default(false) });
    return {
        name: 'discord.create_invite',
        description: 'Create an invite for a channel.',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id, max_age, max_uses, temporary } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            const rest = dc['rest'];
            const res = await rest.post(Routes.channelInvites(channel_id), { body: { max_age, max_uses, temporary } });
            yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
        }
    };
}
export function deleteInviteTool(dc) {
    const input = z.object({ code: z.string() });
    return {
        name: 'discord.delete_invite',
        description: 'Delete an invite by code.',
        inputSchema: input,
        async *handler({ input }) {
            const { code } = input;
            const rest = dc['rest'];
            await rest.delete(Routes.invite(code));
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
