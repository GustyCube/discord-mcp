import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { DiscordClient } from '../discord.js';
import { Policy } from '../policy.js';

export function createInviteTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string(), max_age: z.number().int().min(0).max(604800).default(86400), max_uses: z.number().int().min(0).max(100).default(0), temporary: z.boolean().default(false) });
  return {
    name: 'discord_create_invite',
    description: 'Create an invite for a channel.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, max_age, max_uses, temporary } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const rest = (dc as any)['rest'] as REST;
      const res = await rest.post(Routes.channelInvites(channel_id), { body: { max_age, max_uses, temporary } });
      yield { content: [{ type: 'text', text: JSON.stringify(res) }] };
    }
  };
}

export function deleteInviteTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ code: z.string() });
  return {
    name: 'discord_delete_invite',
    description: 'Delete an invite by code.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { code } = input as any;
      const rest = (dc as any)['rest'] as REST;
      await rest.delete(Routes.invite(code));
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
