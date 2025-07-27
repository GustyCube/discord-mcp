import { z } from 'zod';
import { Routes } from 'discord-api-types/v10';
export function listCommandsTool(dc) {
    const input = z.object({ application_id: z.string(), guild_id: z.string().optional() });
    return {
        name: 'discord.list_commands',
        description: 'List application (slash) commands (global or guild).',
        inputSchema: input,
        async *handler({ input }) {
            const { application_id, guild_id } = input;
            const rest = dc['rest'];
            const res = guild_id
                ? await rest.get(Routes.applicationGuildCommands(application_id, guild_id))
                : await rest.get(Routes.applicationCommands(application_id));
            yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
        }
    };
}
export function upsertCommandTool(dc) {
    const input = z.object({
        application_id: z.string(),
        guild_id: z.string().optional(),
        command: z.any()
    });
    return {
        name: 'discord.upsert_command',
        description: 'Create or update a slash command (global or guild).',
        inputSchema: input,
        async *handler({ input }) {
            const { application_id, guild_id, command } = input;
            const rest = dc['rest'];
            const res = guild_id
                ? await rest.post(Routes.applicationGuildCommands(application_id, guild_id), { body: [command] })
                : await rest.post(Routes.applicationCommands(application_id), { body: [command] });
            yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
        }
    };
}
export function deleteCommandTool(dc) {
    const input = z.object({ application_id: z.string(), command_id: z.string(), guild_id: z.string().optional() });
    return {
        name: 'discord.delete_command',
        description: 'Delete a slash command.',
        inputSchema: input,
        async *handler({ input }) {
            const { application_id, command_id, guild_id } = input;
            const rest = dc['rest'];
            if (guild_id)
                await rest.delete(Routes.applicationGuildCommand(application_id, guild_id, command_id));
            else
                await rest.delete(Routes.applicationCommand(application_id, command_id));
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
