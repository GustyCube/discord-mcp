import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { Routes, type APIRole } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { DiscordClient } from '../discord.js';

export function listRolesTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ guild_id: z.string() });
  return {
    name: 'discord_list_roles',
    description: 'List roles in a guild.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const rest = (dc as any)['rest'] as REST;
      const roles = await rest.get(Routes.guildRoles((input as any).guild_id)) as APIRole[];
      yield { content: [{ type: 'text', text: JSON.stringify(roles) }] };
    }
  };
}

export function createRoleTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ guild_id: z.string(), name: z.string().max(100) });
  return {
    name: 'discord_create_role',
    description: 'Create a role in a guild.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { guild_id, name } = input as any;
      const rest = (dc as any)['rest'] as REST;
      const role = await rest.post(Routes.guildRoles(guild_id), { body: { name } });
      yield { content: [{ type: 'text', text: JSON.stringify(role) }] };
    }
  };
}

export function deleteRoleTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ guild_id: z.string(), role_id: z.string() });
  return {
    name: 'discord_delete_role',
    description: 'Delete a role in a guild.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { guild_id, role_id } = input as any;
      const rest = (dc as any)['rest'] as REST;
      await rest.delete(Routes.guildRole(guild_id, role_id));
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
