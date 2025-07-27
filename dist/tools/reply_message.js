import { z } from 'zod';
export function replyMessageTool(dc, policy, defaultAllowedMentions) {
    const input = z.object({
        channel_id: z.string(),
        message_id: z.string(),
        content: z.string().max(4000),
        confirm: z.boolean().default(true)
    });
    return {
        name: 'discord.reply',
        description: 'Reply to a message in a thread (human-in-the-loop by default).',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id, message_id, content, confirm } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            if (confirm) {
                yield { content: [{ type: 'text', text: `Preview reply -> ${message_id} in ${channel_id}\n---\n${content}\n(Resend with {confirm:false} to post)` }] };
                return;
            }
            const msg = await dc.postMessage(channel_id, { content, message_reference: { message_id }, allowed_mentions: defaultAllowedMentions });
            yield { content: [{ type: 'json', text: JSON.stringify(msg) }] };
        }
    };
}
