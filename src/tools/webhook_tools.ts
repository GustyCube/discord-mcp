import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { DiscordClient } from '../discord.js';
import { Policy } from '../policy.js';

export function listWebhooksTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string() });
  return {
    name: 'discord.webhook_list',
    description: 'List webhooks for a channel.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const hooks = await dc.listChannelWebhooks(channel_id);
      yield { content: [{ type: 'json', text: JSON.stringify(hooks) }] };
    }
  };
}

export function createWebhookTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string(), name: z.string().max(80) });
  return {
    name: 'discord.webhook_create',
    description: 'Create a webhook in a channel (requires MANAGE_WEBHOOKS).',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { channel_id, name } = input as any;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const hook = await dc.createWebhook(channel_id, name);
      // Do NOT expose webhook token unless explicitly requested; redact by default
      const redacted = { ...hook, token: hook.token ? 'redacted' : undefined };
      yield { content: [{ type: 'json', text: JSON.stringify(redacted) }] };
    }
  };
}

export function executeWebhookTool(dc: DiscordClient): ToolHandler {
  const input = z.object({
    webhook_id: z.string(),
    token: z.string().describe('Webhook token (treat as secret)'),
    content: z.string().max(4000).optional(),
    username: z.string().optional(),
    avatar_url: z.string().url().optional(),
    tts: z.boolean().optional()
  }).refine(data => !!data.content, { message: 'content is required' });
  return {
    name: 'discord.webhook_execute',
    description: 'Execute a webhook by id+token to post content.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { webhook_id, token, content, username, avatar_url, tts } = input as any;
      const msg = await dc.executeWebhook(webhook_id, token, { content, username, avatar_url, tts });
      yield { content: [{ type: 'json', text: JSON.stringify(msg) }] };
    }
  };
}

export function deleteWebhookTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ webhook_id: z.string() });
  return {
    name: 'discord.webhook_delete',
    description: 'Delete a webhook by id.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const { webhook_id } = input as any;
      await dc.deleteWebhook(webhook_id);
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
