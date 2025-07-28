import { REST } from '@discordjs/rest';
import type { RESTGetAPIChannelMessageResult, RESTGetAPIChannelMessagesQuery, RESTPatchAPIChannelMessageJSONBody, RESTPostAPIChannelMessageJSONBody, RESTPostAPIChannelThreadsJSONBody, RESTPostAPIWebhookWithTokenJSONBody } from 'discord-api-types/v10';
import { Routes, type APIWebhook, type APIChannel, type APIGuild, type APIMessage } from 'discord-api-types/v10';
import { request } from 'undici';
import { DiscordAPIError } from './errors.js';

export class DiscordClient {
  private rest: REST;
  constructor(token: string){
    this.rest = new REST({ version: '10' }).setToken(token);
  }

  /**
   * Wrapper for REST requests with enhanced error handling
   */
  private async request<T>(
    method: 'get' | 'post' | 'patch' | 'put' | 'delete',
    route: string,
    options?: any
  ): Promise<T> {
    try {
      return await (this.rest as any)[method](route, options) as T;
    } catch (error: any) {
      const status = error?.status || 0;
      const message = error?.message || 'Unknown error';
      throw new DiscordAPIError(
        `Discord API Error: ${message}`,
        status,
        route,
        { method, ...options }
      );
    }
  }

  // Guilds: listing via REST with bot tokens is not supported; accept configured allow-list instead.
  async listGuilds(): Promise<APIGuild[]> {
    return [];
  }

  async getChannel(channelId: string): Promise<APIChannel> {
    return this.rest.get(Routes.channel(channelId)) as Promise<APIChannel>;
  }

  async listChannelWebhooks(channelId: string): Promise<APIWebhook[]> {
    return this.rest.get(Routes.channelWebhooks(channelId)) as Promise<APIWebhook[]>;
  }

  async createWebhook(channelId: string, name: string): Promise<APIWebhook> {
    return this.rest.post(Routes.channelWebhooks(channelId), { body: { name } }) as Promise<APIWebhook>;
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.rest.delete(Routes.webhook(webhookId));
  }

  async modifyWebhook(webhookId: string, body: { name?: string; channel_id?: string;}): Promise<APIWebhook> {
    return this.rest.patch(Routes.webhook(webhookId), { body }) as Promise<APIWebhook>;
  }

  async fetchMessages(channelId: string, query: RESTGetAPIChannelMessagesQuery): Promise<APIMessage[]> {
    const queryParams = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) queryParams.set(k, String(v));
    });
    return this.rest.get(Routes.channelMessages(channelId), { query: queryParams }) as Promise<APIMessage[]>;
  }

  async getMessage(channelId: string, messageId: string): Promise<RESTGetAPIChannelMessageResult> {
    return this.rest.get(Routes.channelMessage(channelId, messageId)) as Promise<RESTGetAPIChannelMessageResult>;
  }

  async postMessage(channelId: string, body: RESTPostAPIChannelMessageJSONBody): Promise<APIMessage> {
    return this.rest.post(Routes.channelMessages(channelId), { body }) as Promise<APIMessage>;
  }

  async editMessage(channelId: string, messageId: string, body: RESTPatchAPIChannelMessageJSONBody): Promise<APIMessage> {
    return this.rest.patch(Routes.channelMessage(channelId, messageId), { body }) as Promise<APIMessage>;
  }

  async addReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    await this.rest.put(Routes.channelMessageOwnReaction(channelId, messageId, emoji));
  }

  async deleteReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    await this.rest.delete(Routes.channelMessageOwnReaction(channelId, messageId, emoji));
  }

  async createThread(channelId: string, body: RESTPostAPIChannelThreadsJSONBody): Promise<APIChannel> {
    return this.rest.post(Routes.threads(channelId), { body }) as Promise<APIChannel>;
  }

  // Webhook execution bypasses bot auth; use undici against the webhook URL.
  async executeWebhook(id: string, token: string, body: RESTPostAPIWebhookWithTokenJSONBody): Promise<APIMessage | null> {
    const url = `https://discord.com/api/v10/webhooks/${id}/${token}`;
    const res = await request(url, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const txt = await res.body.text();
      try { return JSON.parse(txt) as APIMessage; } catch { return null; }
    } else {
      const text = await res.body.text();
      throw new Error(`Webhook execute failed: ${res.statusCode} ${text}`);
    }
  }
}
