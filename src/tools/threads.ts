import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { DiscordClient } from '../discord.js';
import { Policy } from '../policy.js';

export function listPublicArchivedThreadsTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string(), before: z.string().optional(), limit: z.number().int().min(1).max(100).optional() });
  return {
    name: 'discord.list_public_archived_threads',
    description: 'List public archived threads in a channel.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, before, limit } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const rest = (dc as any)['rest'] as REST;
      const queryParams = new URLSearchParams();
      if (before) queryParams.set('before', before);
      if (limit) queryParams.set('limit', limit.toString());
      const res = await rest.get(`/channels/${channel_id}/threads/archived/public` + (queryParams.toString() ? `?${queryParams.toString()}` : ''));
      yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
    }
  };
}

export function listPrivateArchivedThreadsTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string(), before: z.string().optional(), limit: z.number().int().min(1).max(100).optional() });
  return {
    name: 'discord.list_private_archived_threads',
    description: 'List private archived threads in a channel.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, before, limit } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const rest = (dc as any)['rest'] as REST;
      const queryParams = new URLSearchParams();
      if (before) queryParams.set('before', before);
      if (limit) queryParams.set('limit', limit.toString());
      const res = await rest.get(`/channels/${channel_id}/threads/archived/private` + (queryParams.toString() ? `?${queryParams.toString()}` : ''));
      yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
    }
  };
}

export function listJoinedPrivateArchivedThreadsTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string(), before: z.string().optional(), limit: z.number().int().min(1).max(100).optional() });
  return {
    name: 'discord.list_joined_private_archived_threads',
    description: 'List joined private archived threads in a channel.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, before, limit } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const rest = (dc as any)['rest'] as REST;
      const queryParams = new URLSearchParams();
      if (before) queryParams.set('before', before);
      if (limit) queryParams.set('limit', limit.toString());
      const res = await rest.get(Routes.channelJoinedArchivedThreads(channel_id) + (queryParams.toString() ? `?${queryParams.toString()}` : ''));
      yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
    }
  };
}
