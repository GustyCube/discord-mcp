import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { Buffer } from 'node:buffer';
import { DiscordClient } from '../discord.js';

export function listGuildStickersTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ guild_id: z.string() });
  return {
    name: 'discord.list_guild_stickers',
    description: 'List stickers in a guild.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { guild_id } = input as any;
      const rest = (dc as any)['rest'] as REST;
      const res = await rest.get(Routes.guildStickers(guild_id));
      yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
    }
  };
}

export function createGuildStickerTool(dc: DiscordClient): ToolHandler {
  const input = z.object({
    guild_id: z.string(),
    name: z.string().max(30),
    description: z.string().max(100).optional(),
    tags: z.string(),
    filename: z.string(),
    file_base64: z.string().describe('Base64-encoded PNG/APNG/Lottie file')
  });
  return {
    name: 'discord.create_guild_sticker',
    description: 'Create a guild sticker (PNG/APNG/Lottie).',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { guild_id, name, description, tags, filename, file_base64 } = input as any;
      const rest = (dc as any)['rest'] as REST;
      const file = Buffer.from(file_base64, 'base64');
      const res = await rest.post(Routes.guildStickers(guild_id), { body: { name, description, tags }, files: [{ name: filename, data: file }] });
      yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
    }
  };
}

export function deleteGuildStickerTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ guild_id: z.string(), sticker_id: z.string() });
  return {
    name: 'discord.delete_guild_sticker',
    description: 'Delete a guild sticker.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { guild_id, sticker_id } = input as any;
      const rest = (dc as any)['rest'] as REST;
      await rest.delete(Routes.guildSticker(guild_id, sticker_id));
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
