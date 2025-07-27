import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { DiscordClient } from '../discord.js';

const ALLOWED = new Set([
  'GET:/guilds/:guild_id/channels',
  'GET:/channels/:channel_id/messages',
  'POST:/channels/:channel_id/messages',
  'PATCH:/channels/:channel_id',
  'DELETE:/channels/:channel_id',
]);

export function rawRestTool(dc: DiscordClient, enabled: boolean): ToolHandler {
  const input = z.object({
    method: z.enum(['GET','POST','PUT','PATCH','DELETE']),
    route: z.string().describe('E.g., /channels/:channel_id/messages'),
    params: z.record(z.string()).default({}),
    body: z.any().optional()
  });
  return {
    name: 'discord.raw_rest',
    description: enabled ? 'Call a whitelisted Discord REST route directly.' : 'Disabled by server policy.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      if (!enabled) throw new Error('raw_rest is disabled by policy');
      const { method, route, params, body } = input as any;
      const rest = (dc as any)['rest'] as REST;
      const key = `${method}:${route}`;
      if (!ALLOWED.has(key)) throw new Error('Route not allowed');
      // Very light templating for :params
      let path = route;
      for (const [k,v] of Object.entries(params)) path = path.replace(`:${k}`, String(v));
      const fn = method.toLowerCase() as 'get'|'post'|'put'|'patch'|'delete';
      const res = await (rest as any)[fn](path.startsWith('/v10') ? path : `/v10${path}`, body ? { body } : {});
      yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
    }
  };
}
