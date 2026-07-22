import assert from 'node:assert/strict';
import test from 'node:test';
import type { DiscordClient } from './discord.js';
import type { Policy } from './policy.js';
import { generateTools } from './generator.js';

test('generateTools excludes destructive Discord tools', () => {
  const client = { getRest: () => ({}) } as DiscordClient;
  const policy = {} as Policy;
  const catalog = [
    {
      name: 'discord_delete_message',
      method: 'DELETE' as const,
      path: '/channels/:channel_id/messages/:message_id',
      description: 'Delete a message',
      schema: { type: 'object', properties: {} },
    },
    {
      name: 'discord_get_channel',
      method: 'GET' as const,
      path: '/channels/:channel_id',
      description: 'Get a channel',
      schema: { type: 'object', properties: {} },
    },
  ];

  const tools = generateTools(catalog, client, policy, {
    packsEnabled: new Set(['CORE']),
    defaultAllowedMentions: {},
  });

  assert.deepEqual(tools.map(({ entry }) => entry.name), ['discord_get_channel']);
});
