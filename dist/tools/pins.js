import { z } from 'zod';
import { Routes } from 'discord-api-types/v10';
export function listPinsTool(dc, policy) {
    const input = z.object({ channel_id: z.string() });
    return {
        name: 'discord.list_pins',
        description: 'List pinned messages in a channel.',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            const rest = dc['rest'];
            const pins = await rest.get(Routes.channelPins(channel_id));
            yield { content: [{ type: 'json', text: JSON.stringify(pins) }] };
        }
    };
}
export function pinMessageTool(dc, policy) {
    const input = z.object({ channel_id: z.string(), message_id: z.string() });
    return {
        name: 'discord.pin_message',
        description: 'Pin a message in a channel.',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id, message_id } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            const rest = dc['rest'];
            await rest.put(Routes.channelPin(channel_id, message_id));
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
export function unpinMessageTool(dc, policy) {
    const input = z.object({ channel_id: z.string(), message_id: z.string() });
    return {
        name: 'discord.unpin_message',
        description: 'Unpin a message in a channel.',
        inputSchema: input,
        async *handler({ input }) {
            const { channel_id, message_id } = input;
            if (!policy.allowChannel(channel_id))
                throw new Error('Channel not allowed by policy');
            const rest = dc['rest'];
            await rest.delete(Routes.channelPin(channel_id, message_id));
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
