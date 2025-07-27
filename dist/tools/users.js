import { z } from 'zod';
import { Routes } from 'discord-api-types/v10';
export function getUserTool(dc) {
    const input = z.object({ user_id: z.string() });
    return {
        name: 'discord.get_user',
        description: 'Get a user by ID.',
        inputSchema: input,
        async *handler({ input }) {
            const rest = dc['rest'];
            const user = await rest.get(Routes.user(input.user_id));
            yield { content: [{ type: 'json', text: JSON.stringify(user) }] };
        }
    };
}
export function dmUserTool(dc) {
    const input = z.object({ user_id: z.string(), content: z.string().max(4000), confirm: z.boolean().default(true) });
    return {
        name: 'discord.dm_user',
        description: 'Send a DM to a user (human-in-the-loop by default).',
        inputSchema: input,
        async *handler({ input }) {
            const { user_id, content, confirm } = input;
            const rest = dc['rest'];
            if (confirm) {
                yield { content: [{ type: 'text', text: `Preview DM -> ${user_id}\n---\n${content}\n(Resend with {confirm:false})` }] };
                return;
            }
            const dm = await rest.post(Routes.userChannels(), { body: { recipient_id: user_id } });
            const msg = await rest.post(Routes.channelMessages(dm.id), { body: { content } });
            yield { content: [{ type: 'json', text: JSON.stringify(msg) }] };
        }
    };
}
