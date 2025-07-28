import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { DiscordClient } from '../discord.js';
import { Policy } from '../policy.js';
import { Routes, type APIChannel } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';

export function listChannelsTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({
    guild_id: z.string().describe('Guild ID to list channels for'),
    types: z.array(z.enum(['GUILD_TEXT','GUILD_ANNOUNCEMENT','GUILD_FORUM','GUILD_MEDIA'])).optional()
  });
  return {
    name: 'discord_list_channels',
    description: 'List channels in a guild (filterable by type).',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { guild_id, types } = input as z.infer<typeof input>;
      if (!policy.allowGuild(guild_id)) throw new Error('Guild not allowed by policy');
      
      try {
        // Use the DiscordClient's private request method
        const channels = await (dc as any).request('get', Routes.guildChannels(guild_id)) as APIChannel[];
        const filtered = types && types.length > 0
          ? channels.filter(c => types.includes((c as any).type))
          : channels;
        yield { content: [{ type: 'text', text: JSON.stringify(filtered, null, 2) }] };
      } catch (error: any) {
        yield { content: [{ type: 'text', text: `Error listing channels: ${error.message}` }] };
      }
    }
  };
}
