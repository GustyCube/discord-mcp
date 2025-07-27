import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { DiscordClient } from '../discord.js';
import { Policy } from '../policy.js';
import { Routes, type APIMessage } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';

export function listPinsTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string() });
  return {
    name: 'discord.list_pins',
    description: 'List pinned messages in a channel.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const rest = (dc as any)['rest'] as REST;
      const pins = await rest.get(Routes.channelPins(channel_id)) as APIMessage[];
      yield { content: [{ type: 'json', text: JSON.stringify(pins) }] };
    }
  };
}

export function pinMessageTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string(), message_id: z.string() });
  return {
    name: 'discord.pin_message',
    description: 'Pin a message in a channel.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, message_id } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const rest = (dc as any)['rest'] as REST;
      await rest.put(Routes.channelPin(channel_id, message_id));
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}

export function unpinMessageTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string(), message_id: z.string() });
  return {
    name: 'discord.unpin_message',
    description: 'Unpin a message in a channel.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, message_id } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const rest = (dc as any)['rest'] as REST;
      await rest.delete(Routes.channelPin(channel_id, message_id));
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
