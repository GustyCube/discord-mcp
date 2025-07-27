import { WebSocketManager } from '@discordjs/ws';
import { EventEmitter } from 'node:events';
export class GatewayManager extends EventEmitter {
    #wsm;
    #queue = [];
    #filters = {};
    #max = 1000;
    constructor(token, intents) {
        super();
        this.#wsm = new WebSocketManager({
            token,
            intents,
            shardCount: 1,
        });
        this.#wsm.on('event', (data) => {
            const ev = data;
            if (!this.#passes(ev))
                return;
            this.#queue.push(ev);
            if (this.#queue.length > this.#max)
                this.#queue.shift();
            this.emit('event', ev);
        });
    }
    start() {
        this.#wsm.connect();
    }
    setFilters(f) {
        this.#filters = f;
    }
    getEvents(max = 50) {
        return this.#queue.splice(0, Math.min(max, this.#queue.length));
    }
    info() {
        return { connected: this.#wsm.status === 0 || this.#wsm.status === 1 };
    }
    #passes(ev) {
        const f = this.#filters;
        if (f.eventTypes && f.eventTypes.length && !f.eventTypes.includes(ev.t))
            return false;
        // Filter by guild/channel if IDs are present in payload (best-effort)
        const guildId = ev?.d?.guild_id ?? ev?.d?.guild?.id ?? null;
        if (f.guildIds && f.guildIds.length && guildId && !f.guildIds.includes(guildId))
            return false;
        const channelId = ev?.d?.channel_id ?? ev?.d?.id ?? null;
        if (f.channelIds && f.channelIds.length && channelId && !f.channelIds.includes(channelId))
            return false;
        return true;
    }
}
