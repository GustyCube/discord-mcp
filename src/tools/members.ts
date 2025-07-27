import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { DiscordClient } from '../discord.js';

export function getMemberTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ guild_id: z.string(), user_id: z.string() });
  return {
    name: 'discord.get_member',
    description: 'Get a guild member.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { guild_id, user_id } = input as any;
      const rest = (dc as any)['rest'] as REST;
      const res = await rest.get(Routes.guildMember(guild_id, user_id));
      yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
    }
  };
}

export function addMemberRoleTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ guild_id: z.string(), user_id: z.string(), role_id: z.string() });
  return {
    name: 'discord.add_member_role',
    description: 'Add a role to a member.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { guild_id, user_id, role_id } = input as any;
      const rest = (dc as any)['rest'] as REST;
      await rest.put(Routes.guildMemberRole(guild_id, user_id, role_id));
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}

export function removeMemberRoleTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ guild_id: z.string(), user_id: z.string(), role_id: z.string() });
  return {
    name: 'discord.remove_member_role',
    description: 'Remove a role from a member.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { guild_id, user_id, role_id } = input as any;
      const rest = (dc as any)['rest'] as REST;
      await rest.delete(Routes.guildMemberRole(guild_id, user_id, role_id));
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}

export function kickMemberTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ guild_id: z.string(), user_id: z.string(), reason: z.string().optional() });
  return {
    name: 'discord.kick_member',
    description: 'Kick (remove) a member from a guild.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { guild_id, user_id, reason } = input as any;
      const rest = (dc as any)['rest'] as REST;
      await rest.delete(Routes.guildMember(guild_id, user_id), { reason });
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
