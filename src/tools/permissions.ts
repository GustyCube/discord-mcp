import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { Routes, OverwriteType } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { DiscordClient } from '../discord.js';
import { Policy } from '../policy.js';

export function setChannelPermissionTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({
    channel_id: z.string(),
    overwrite_id: z.string(),
    type: z.number().default(OverwriteType.Role),
    allow: z.string().default('0'),
    deny: z.string().default('0')
  });
  return {
    name: 'discord_set_channel_permission',
    description: 'Set a permission overwrite on a channel (be careful).',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, overwrite_id, type, allow, deny } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const rest = (dc as any)['rest'] as REST;
      await rest.put(Routes.channelPermission(channel_id, overwrite_id), { body: { type, allow, deny } });
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
