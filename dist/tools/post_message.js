import { z } from 'zod';
export function postMessageTool(dc, policy, defaultAllowedMentions) {
    const input = z.object({
        channel_id: z.string(),
        content: z.string().max(4000),
        confirm: z.boolean().default(true)
    });
    return {
        name: 'discord.post_message',
        description: 'Post a message to a channel (human-in-the-loop via confirm=true).',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id, content, confirm } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            if (confirm) {
                yield { content: [{ type: 'text', text: `Preview:\nChannel: ${channel_id}\n---\n${content}\n(Resend with {confirm:false} to post)` }] };
                return;
            }
            const msg = await dc.postMessage(channel_id, { content, allowed_mentions: defaultAllowedMentions });
            yield { content: [{ type: 'json', text: JSON.stringify(msg) }] };
        }
    };
}
