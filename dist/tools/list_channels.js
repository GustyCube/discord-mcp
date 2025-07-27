import { z } from 'zod';
import { Routes } from 'discord-api-types/v10';
export function listChannelsTool(dc, policy) {
    const input = z.object({
        guild_id: z.string().describe('Guild ID to list channels for'),
        types: z.array(z.enum(['GUILD_TEXT', 'GUILD_ANNOUNCEMENT', 'GUILD_FORUM', 'GUILD_MEDIA'])).optional()
    });
    return {
        name: 'discord.list_channels',
        description: 'List channels in a guild (filterable by type).',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, types } = input;
            if (!policy.allowGuild(guild_id))
                throw new Error('Guild not allowed by policy');
            // Use raw REST via @discordjs/rest
            const rest = dc['rest']; // internal; acceptable here for listing
            const channels = await rest.get(Routes.guildChannels(guild_id));
            const filtered = types && types.length > 0
                ? channels.filter(c => types.includes(c.type))
                : channels;
            yield { content: [{ type: 'json', text: JSON.stringify(filtered) }] };
        }
    };
}
