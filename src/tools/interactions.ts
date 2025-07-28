import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { DiscordClient } from '../discord.js';

export function listCommandsTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ application_id: z.string(), guild_id: z.string().optional() });
  return {
    name: 'discord_list_commands',
    description: 'List application (slash) commands (global or guild).',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { application_id, guild_id } = input as any;
      const rest = (dc as any)['rest'] as REST;
      const res = guild_id
        ? await rest.get(Routes.applicationGuildCommands(application_id, guild_id))
        : await rest.get(Routes.applicationCommands(application_id));
      yield { content: [{ type: 'text', text: JSON.stringify(res) }] };
    }
  };
}

export function upsertCommandTool(dc: DiscordClient): ToolHandler {
  const input = z.object({
    application_id: z.string(),
    guild_id: z.string().optional(),
    command: z.any()
  });
  return {
    name: 'discord_upsert_command',
    description: 'Create or update a slash command (global or guild).',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { application_id, guild_id, command } = input as any;
      const rest = (dc as any)['rest'] as REST;
      const res = guild_id
        ? await rest.post(Routes.applicationGuildCommands(application_id, guild_id), { body: [command] })
        : await rest.post(Routes.applicationCommands(application_id), { body: [command] });
      yield { content: [{ type: 'text', text: JSON.stringify(res) }] };
    }
  };
}

export function deleteCommandTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ application_id: z.string(), command_id: z.string(), guild_id: z.string().optional() });
  return {
    name: 'discord_delete_command',
    description: 'Delete a slash command.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { application_id, command_id, guild_id } = input as any;
      const rest = (dc as any)['rest'] as REST;
      if (guild_id) await rest.delete(Routes.applicationGuildCommand(application_id, guild_id, command_id));
      else await rest.delete(Routes.applicationCommand(application_id, command_id));
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
