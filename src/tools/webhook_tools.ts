import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';
import { DiscordClient } from '../discord.js';
import { Policy } from '../policy.js';

export function listWebhooksTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string() });
  return {
    name: 'discord_webhook_list',
    description: 'List webhooks for a channel.',
    inputSchema: input,
    async *handler({ input }) {
      const validated = z.object({ channel_id: z.string() }).parse(input);
      const { channel_id } = validated;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const hooks = await dc.listChannelWebhooks(channel_id);
      yield { content: [{ type: 'text', text: JSON.stringify(hooks) }] };
    }
  };
}

export function createWebhookTool(dc: DiscordClient, policy: Policy): ToolHandler {
  const input = z.object({ channel_id: z.string(), name: z.string().max(80) });
  return {
    name: 'discord_webhook_create',
    description: 'Create a webhook in a channel (requires MANAGE_WEBHOOKS).',
    inputSchema: input,
    async *handler({ input }) {
      const validated = z.object({ channel_id: z.string(), name: z.string().max(80) }).parse(input);
      const { channel_id, name } = validated;
      if (!policy.allowChannel(channel_id)) throw new Error('Channel not allowed by policy');
      const hook = await dc.createWebhook(channel_id, name);
      // Ensure webhook token is never exposed in responses, logs, or error messages
      const { token, ...safeHook } = hook;
      const redacted = { ...safeHook, token: token ? '[REDACTED]' : undefined };
      yield { content: [{ type: 'text', text: JSON.stringify(redacted) }] };
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
    tts: z.boolean().optional(),
    embeds: z.array(z.any()).optional().describe('Array of embed objects')
  });
  return {
    name: 'discord_webhook_execute',
    description: 'Execute a webhook by id+token to post content and/or embeds.',
    inputSchema: input,
    async *handler({ input }) {
      const validated = input as z.infer<typeof input>;
      const { webhook_id, token, content, username, avatar_url, tts, embeds } = validated;
      
      // Validate that either content or embeds is provided
      if (!content && (!embeds || embeds.length === 0)) {
        throw new Error('Either content or embeds is required');
      }
      
      // Parse embeds if they're provided as strings
      let parsedEmbeds = embeds;
      if (embeds && typeof embeds === 'string') {
        try {
          parsedEmbeds = JSON.parse(embeds);
        } catch (e) {
          throw new Error('Invalid embeds JSON format');
        }
      }
      
      const webhookData: any = { content, username, avatar_url, tts };
      if (parsedEmbeds && Array.isArray(parsedEmbeds)) {
        webhookData.embeds = parsedEmbeds;
      }
      
      const msg = await dc.executeWebhook(webhook_id, token, webhookData);
      yield { content: [{ type: 'text', text: JSON.stringify(msg) }] };
    }
  };
}

export function deleteWebhookTool(dc: DiscordClient): ToolHandler {
  const input = z.object({ webhook_id: z.string() });
  return {
    name: 'discord_webhook_delete',
    description: 'Delete a webhook by id.',
    inputSchema: input,
    async *handler({ input }) {
      const validated = z.object({ webhook_id: z.string() }).parse(input);
      const { webhook_id } = validated;
      await dc.deleteWebhook(webhook_id);
      yield { content: [{ type: 'text', text: 'ok' }] };
    }
  };
}
