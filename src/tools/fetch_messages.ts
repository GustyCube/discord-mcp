import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { DiscordClient } from '../discord.js';
import { Policy } from '../policy.js';

export function fetchMessagesTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({
    channel_id: z.string(),
    limit: z.number().int().min(1).max(100).default(50),
    before: z.string().optional(),
    after: z.string().optional()
  });
  return {
    name: 'discord_fetch_messages',
    description: 'Fetch recent messages in a channel (paginated).',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, limit, before, after } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const msgs = await dc.fetchMessages(channel_id, { limit, before, after });
      yield { content: [{ type: 'text', text: JSON.stringify(msgs) }] };
    }
  };
}
