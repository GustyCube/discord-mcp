import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { DiscordClient } from '../discord.js';
import { Policy } from '../policy.js';

export function triggerTypingTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string() });
  return {
    name: 'discord_trigger_typing',
    description: 'Trigger typing indicator in a channel.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const rest = (dc as any)['rest'] as REST;
      await rest.post(Routes.channelTyping(channel_id), {});
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
