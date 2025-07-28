import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { DiscordClient } from '../discord.js';
import { Policy } from '../policy.js';

export function clearAllReactionsTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string(), message_id: z.string() });
  return {
    name: 'discord.clear_all_reactions',
    description: 'Remove all reactions from a message.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, message_id } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const rest = (dc as any)['rest'] as REST;
      await rest.delete(Routes.channelMessageAllReactions(channel_id, message_id));
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}

export function removeUserReactionTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string(), message_id: z.string(), emoji: z.string(), user_id: z.string() });
  return {
    name: 'discord.remove_user_reaction',
    description: 'Remove a specific user’s reaction emoji (requires perms).',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, message_id, emoji, user_id } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const rest = (dc as any)['rest'] as REST;
      const route = Routes.channelMessageReaction(channel_id, message_id, emoji);
      await rest.delete(`${route}/${user_id}` as `/${string}`);
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
