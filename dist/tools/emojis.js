import { z } from 'zod';
import { Routes } from 'discord-api-types/v10';
export function listEmojisTool(dc) {
    const input = z.object({ guild_id: z.string() });
    return {
        name: 'discord.list_emojis',
        description: 'List custom emojis in a guild.',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id } = input;
            const rest = dc['rest'];
            const res = await rest.get(Routes.guildEmojis(guild_id));
            yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
        }
    };
}
export function createEmojiTool(dc) {
    const input = z.object({ guild_id: z.string(), name: z.string().max(32), image_base64: z.string().describe('data:image/png;base64,... or raw base64 png'), roles: z.array(z.string()).optional() });
    return {
        name: 'discord.create_emoji',
        description: 'Create a custom emoji (PNG, max size per Discord limits).',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, name, image_base64, roles } = input;
            const rest = dc['rest'];
            const image = image_base64.startsWith('data:') ? image_base64 : `data:image/png;base64,${image_base64}`;
            const res = await rest.post(Routes.guildEmojis(guild_id), { body: { name, image, roles } });
            yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
        }
    };
}
export function deleteEmojiTool(dc) {
    const input = z.object({ guild_id: z.string(), emoji_id: z.string() });
    return {
        name: 'discord.delete_emoji',
        description: 'Delete a custom emoji.',
        inputSchema: input,
        async *handler({ input }) {
            const { guild_id, emoji_id } = input;
            const rest = dc['rest'];
            await rest.delete(Routes.guildEmoji(guild_id, emoji_id));
            yield { content: [{ type: 'text', text: 'ok' }] };
        }
    };
}
