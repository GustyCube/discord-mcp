import { z } from 'zod';
import { Buffer } from 'node:buffer';
export function postMessageWithFilesTool(dc, policy, defaultAllowedMentions) {
    const fileSchema = z.object({ filename: z.string(), base64: z.string() });
    const input = z.object({
        channel_id: z.string(),
        content: z.string().max(4000).optional(),
        files: z.array(fileSchema).min(1).max(10),
        confirm: z.boolean().default(true)
    });
    return {
        name: 'discord.post_message_files',
        description: 'Post a message with 1-10 file attachments (base64).',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id, content, files, confirm } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            if (confirm) {
                const names = files.map((f) => f.filename).join(', ');
                yield { content: [{ type: 'text', text: `Preview (files: ${names}) to ${channel_id}\n---\n${content ?? ''}\n(Resend with {confirm:false})` }] };
                return;
            }
            const payloadFiles = files.map((f, i) => ({ name: f.filename, data: Buffer.from(f.base64, 'base64') }));
            const msg = await dc['rest'].post(`/v10/channels/${channel_id}/messages`, { body: { content, allowed_mentions: defaultAllowedMentions }, files: payloadFiles });
            yield { content: [{ type: 'json', text: JSON.stringify(msg) }] };
        }
    };
}
