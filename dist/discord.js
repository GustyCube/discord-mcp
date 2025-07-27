import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { request } from 'undici';
export class DiscordClient {
    rest;
    constructor(token) {
        this.rest = new REST({ version: '10' }).setToken(token);
    }
    // Guilds: listing via REST with bot tokens is not supported; accept configured allow-list instead.
    async listGuilds() {
        return [];
    }
    async getChannel(channelId) {
        return this.rest.get(Routes.channel(channelId));
    }
    async listChannelWebhooks(channelId) {
        return this.rest.get(Routes.channelWebhooks(channelId));
    }
    async createWebhook(channelId, name) {
        return this.rest.post(Routes.channelWebhooks(channelId), { body: { name } });
    }
    async deleteWebhook(webhookId) {
        await this.rest.delete(Routes.webhook(webhookId));
    }
    async modifyWebhook(webhookId, body) {
        return this.rest.patch(Routes.webhook(webhookId), { body });
    }
    async fetchMessages(channelId, query) {
        return this.rest.get(Routes.channelMessages(channelId), { query: Object.fromEntries(Object.entries(query).map(([k, v]) => [k, String(v)])) });
    }
    async getMessage(channelId, messageId) {
        return this.rest.get(Routes.channelMessage(channelId, messageId));
    }
    async postMessage(channelId, body) {
        return this.rest.post(Routes.channelMessages(channelId), { body });
    }
    async editMessage(channelId, messageId, body) {
        return this.rest.patch(Routes.channelMessage(channelId, messageId), { body });
    }
    async addReaction(channelId, messageId, emoji) {
        await this.rest.put(Routes.channelMessageOwnReaction(channelId, messageId, emoji));
    }
    async deleteReaction(channelId, messageId, emoji) {
        await this.rest.delete(Routes.channelMessageOwnReaction(channelId, messageId, emoji));
    }
    async createThread(channelId, body) {
        return this.rest.post(Routes.threads(channelId), { body });
    }
    // Webhook execution bypasses bot auth; use undici against the webhook URL.
    async executeWebhook(id, token, body) {
        const url = `https://discord.com/api/v10/webhooks/${id}/${token}`;
        const res = await request(url, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const txt = await res.body.text();
            try {
                return JSON.parse(txt);
            }
            catch {
                return null;
            }
        }
        else {
            const text = await res.body.text();
            throw new Error(`Webhook execute failed: ${res.statusCode} ${text}`);
        }
    }
}
