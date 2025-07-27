import { z } from 'zod';
export function gatewaySubscribeTool(gw) {
    const input = z.object({
        event_types: z.array(z.string()).optional(),
        guild_ids: z.array(z.string()).optional(),
        channel_ids: z.array(z.string()).optional()
    });
    return {
        name: 'discord.gateway_subscribe',
        description: 'Set filters for which Gateway events are queued for retrieval.',
        inputSchema: input,
        async *handler({ input }) {
            const { event_types, guild_ids, channel_ids } = input;
            gw.setFilters({ eventTypes: event_types, guildIds: guild_ids, channelIds: channel_ids });
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
export function gatewayGetEventsTool(gw) {
    const input = z.object({ max: z.number().int().min(1).max(200).default(50) });
    return {
        name: 'discord.gateway_get_events',
        description: 'Retrieve queued Gateway events (after filtering).',
        inputSchema: input,
        async *handler({ input }) {
            const { max } = input;
            const events = gw.getEvents(max);
            yield { content: [{ type: 'json', text: JSON.stringify(events) }] };
        }
    };
}
export function gatewayInfoTool(gw) {
    const input = z.object({});
    return {
        name: 'discord.gateway_info',
        description: 'Get basic Gateway connection status.',
        inputSchema: input,
        async *handler() {
            yield { content: [{ type: 'json', text: JSON.stringify(gw.info()) }] };
        }
    };
}
