import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { Routes, ChannelType } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { DiscordClient } from '../discord.js';
import { Policy } from '../policy.js';

export function createChannelTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ guild_id: z.string(), name: z.string().max(100), type: z.number().default(ChannelType.GuildText) });
  return {
    name: 'discord.create_channel',
    description: 'Create a channel in a guild.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { guild_id, name, type } = input as any;
      const rest = (dc as any)['rest'] as REST;
      const ch = await rest.post(Routes.guildChannels(guild_id), { body: { name, type } });
      yield { content: [{ type: 'json', text: JSON.stringify(ch) }] };
    }
  };
}

export function editChannelTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string(), name: z.string().optional() });
  return {
    name: 'discord.edit_channel',
    description: 'Edit a channel (limited fields).',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, name } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const rest = (dc as any)['rest'] as REST;
      const ch = await rest.patch(Routes.channel(channel_id), { body: { name } });
      yield { content: [{ type: 'json', text: JSON.stringify(ch) }] };
    }
  };
}

export function deleteChannelTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string() });
  return {
    name: 'discord.delete_channel',
    description: 'Delete a channel.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const rest = (dc as any)['rest'] as REST;
      await rest.delete(Routes.channel(channel_id));
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
