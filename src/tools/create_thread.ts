import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { DiscordClient } from '../discord.js';
import { Policy } from '../policy.js';

export function createThreadTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({
    channel_id: z.string(),
    name: z.string().max(100),
    message_id: z.string().optional()
  });
  return {
    name: 'discord_create_thread',
    description: 'Create a thread in a channel; optionally from an existing message.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, name, message_id } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const body: any = { name };
      if (message_id) body.message_id = message_id;
      const thread = await dc.createThread(channel_id, body);
      yield { content: [{ type: 'text', text: JSON.stringify(thread) }] };
    }
  };
}
