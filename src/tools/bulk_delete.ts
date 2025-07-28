import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { DiscordClient } from '../discord.js';
import { Policy } from '../policy.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';

export function bulkDeleteMessagesTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string(), message_ids: z.array(z.string()).min(2).max(100) });
  return {
    name: 'discord_bulk_delete_messages',
    description: 'Bulk delete 2-100 messages (must be <14 days old).',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, message_ids } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const rest = (dc as any)['rest'] as REST;
      await rest.post(Routes.channelBulkDelete(channel_id), { body: { messages: message_ids }});
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
