import { z } from 'zod';
import { Routes } from 'discord-api-types/v10';
export function listRolesTool(dc) {
    const input = z.object({ guild_id: z.string() });
    return {
        name: 'discord.list_roles',
        description: 'List roles in a guild.',
        inputSchema: input,
        async *handler({ input }) {
            const rest = dc['rest'];
            const roles = await rest.get(Routes.guildRoles(input.guild_id));
            yield { content: [{ type: 'json', text: JSON.stringify(roles) }] };
        }
    };
}
export function createRoleTool(dc) {
    const input = z.object({ guild_id: z.string(), name: z.string().max(100) });
    return {
        name: 'discord.create_role',
        description: 'Create a role in a guild.',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, name } = input;
            const rest = dc['rest'];
            const role = await rest.post(Routes.guildRoles(guild_id), { body: { name } });
            yield { content: [{ type: 'json', text: JSON.stringify(role) }] };
        }
    };
}
export function deleteRoleTool(dc) {
    const input = z.object({ guild_id: z.string(), role_id: z.string() });
    return {
        name: 'discord.delete_role',
        description: 'Delete a role in a guild.',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, role_id } = input;
            const rest = dc['rest'];
            await rest.delete(Routes.guildRole(guild_id, role_id));
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
