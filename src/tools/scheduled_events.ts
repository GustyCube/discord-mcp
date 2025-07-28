import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { Routes, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { DiscordClient } from '../discord.js';

export function listScheduledEventsTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ guild_id: z.string(), with_user_count: z.boolean().default(false) });
  return {
    name: 'discord_list_scheduled_events',
    description: 'List scheduled events in a guild.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { guild_id, with_user_count } = input as any;
      const rest = (dc as any)['rest'] as REST;
      const queryParams = new URLSearchParams();
      if (with_user_count) queryParams.set('with_user_count', 'true');
      const route = Routes.guildScheduledEvents(guild_id);
      const res = await rest.get((queryParams.toString() ? `${route}?${queryParams.toString()}` : route) as `/${string}`);
      yield { content: [{ type: 'text', text: JSON.stringify(res) }] };
    }
  };
}

export function createScheduledEventTool(dc: DiscordClient): ToolHandler {
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
    name: 'discord_create_scheduled_event',
    description: 'Create a scheduled event.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { guild_id, image_base64, ...body } = input as any;
      const rest = (dc as any)['rest'] as REST;
      const res = await rest.post(Routes.guildScheduledEvents(guild_id), { body: { ...body, image: image_base64 ? (image_base64.startsWith('data:') ? image_base64 : `data:image/png;base64,${image_base64}`) : undefined } });
      yield { content: [{ type: 'text', text: JSON.stringify(res) }] };
    }
  };
}

export function deleteScheduledEventTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ guild_id: z.string(), event_id: z.string() });
  return {
    name: 'discord_delete_scheduled_event',
    description: 'Delete a scheduled event.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { guild_id, event_id } = input as any;
      const rest = (dc as any)['rest'] as REST;
      await rest.delete(Routes.guildScheduledEvent(guild_id, event_id));
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
