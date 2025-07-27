import { z } from 'zod';
import { Routes, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } from 'discord-api-types/v10';
export function listScheduledEventsTool(dc) {
    const input = z.object({ guild_id: z.string(), with_user_count: z.boolean().default(false) });
    return {
        name: 'discord.list_scheduled_events',
        description: 'List scheduled events in a guild.',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, with_user_count } = input;
            const rest = dc['rest'];
            const queryParams = new URLSearchParams();
            if (with_user_count)
                queryParams.set('with_user_count', 'true');
            const res = await rest.get(Routes.guildScheduledEvents(guild_id) + (queryParams.toString() ? `?${queryParams.toString()}` : ''));
            yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
        }
    };
}
export function createScheduledEventTool(dc) {
    const input = z.object({
        guild_id: z.string(),
        name: z.string().max(100),
        scheduled_start_time: z.string().describe('ISO 8601'),
        scheduled_end_time: z.string().optional(),
        privacy_level: z.number().default(GuildScheduledEventPrivacyLevel.GuildOnly),
        entity_type: z.number().default(GuildScheduledEventEntityType.Voice),
        channel_id: z.string().optional(),
        description: z.string().optional(),
        entity_metadata: z.any().optional(), // for external events
        image_base64: z.string().optional()
    });
    return {
        name: 'discord.create_scheduled_event',
        description: 'Create a scheduled event.',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, image_base64, ...body } = input;
            const rest = dc['rest'];
            const res = await rest.post(Routes.guildScheduledEvents(guild_id), { body: { ...body, image: image_base64 ? (image_base64.startsWith('data:') ? image_base64 : `data:image/png;base64,${image_base64}`) : undefined } });
            yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
        }
    };
}
export function deleteScheduledEventTool(dc) {
    const input = z.object({ guild_id: z.string(), event_id: z.string() });
    return {
        name: 'discord.delete_scheduled_event',
        description: 'Delete a scheduled event.',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, event_id } = input;
            const rest = dc['rest'];
            await rest.delete(Routes.guildScheduledEvent(guild_id, event_id));
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
