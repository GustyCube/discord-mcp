import { z } from 'zod';
import { Routes } from 'discord-api-types/v10';
export function getMemberTool(dc) {
    const input = z.object({ guild_id: z.string(), user_id: z.string() });
    return {
        name: 'discord.get_member',
        description: 'Get a guild member.',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, user_id } = input;
            const rest = dc['rest'];
            const res = await rest.get(Routes.guildMember(guild_id, user_id));
            yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
        }
    };
}
export function addMemberRoleTool(dc) {
    const input = z.object({ guild_id: z.string(), user_id: z.string(), role_id: z.string() });
    return {
        name: 'discord.add_member_role',
        description: 'Add a role to a member.',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, user_id, role_id } = input;
            const rest = dc['rest'];
            await rest.put(Routes.guildMemberRole(guild_id, user_id, role_id));
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
export function removeMemberRoleTool(dc) {
    const input = z.object({ guild_id: z.string(), user_id: z.string(), role_id: z.string() });
    return {
        name: 'discord.remove_member_role',
        description: 'Remove a role from a member.',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, user_id, role_id } = input;
            const rest = dc['rest'];
            await rest.delete(Routes.guildMemberRole(guild_id, user_id, role_id));
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
export function kickMemberTool(dc) {
    const input = z.object({ guild_id: z.string(), user_id: z.string(), reason: z.string().optional() });
    return {
        name: 'discord.kick_member',
        description: 'Kick (remove) a member from a guild.',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, user_id, reason } = input;
            const rest = dc['rest'];
            await rest.delete(Routes.guildMember(guild_id, user_id), { reason });
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
