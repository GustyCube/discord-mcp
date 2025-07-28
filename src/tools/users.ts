import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { Routes, type APIUser } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { DiscordClient } from '../discord.js';

export function getUserTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ user_id: z.string() });
  return {
    name: 'discord_get_user',
    description: 'Get a user by ID.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const rest = (dc as any)['rest'] as REST;
      const user = await rest.get(Routes.user((input as any).user_id)) as APIUser;
      yield { content: [{ type: 'text', text: JSON.stringify(user) }] };
    }
  };
}

export function dmUserTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ user_id: z.string(), content: z.string().max(4000), confirm: z.boolean().default(true) });
  return {
    name: 'discord_dm_user',
    description: 'Send a DM to a user (human-in-the-loop by default).',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { user_id, content, confirm } = input as any;
      const rest = (dc as any)['rest'] as REST;
      if (confirm) {
        yield { content: [{ type: 'text', text: `Preview DM -> ${user_id}\n---\n${content}\n(Resend with {confirm:false})` }] };
        return;
      }
      const dm = await rest.post(Routes.userChannels(), { body: { recipient_id: user_id } }) as any;
      const msg = await rest.post(Routes.channelMessages(dm.id), { body: { content } });
      yield { content: [{ type: 'text', text: JSON.stringify(msg) }] };
    }
  };
}
