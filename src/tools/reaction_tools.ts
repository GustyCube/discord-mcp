import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { DiscordClient } from '../discord.js';
import { Policy } from '../policy.js';

export function addReactionTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string(), message_id: z.string(), emoji: z.string() });
  return {
    name: 'discord_add_reaction',
    description: 'Add a reaction emoji to a message.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, message_id, emoji } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      await dc.addReaction(channel_id, message_id, emoji);
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}

export function deleteReactionTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string(), message_id: z.string(), emoji: z.string() });
  return {
    name: 'discord_delete_reaction',
    description: 'Remove your bot reaction from a message.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, message_id, emoji } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      await dc.deleteReaction(channel_id, message_id, emoji);
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
