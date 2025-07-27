import { GatewayIntentBits, type GatewayDispatchEvents } from '@discordjs/core';
import { WebSocketManager } from '@discordjs/ws';
import { EventEmitter } from 'node:events';

type AnyEvent = { t: string; d: any; s: number | null; op: number; shard?: number };

export interface GatewayFilters {
  eventTypes?: string[]; // e.g., ["MESSAGE_CREATE","MESSAGE_UPDATE"]
  guildIds?: string[];
  channelIds?: string[];
}

export class GatewayManager extends EventEmitter {
  #wsm: WebSocketManager;
  #queue: AnyEvent[] = [];
  #filters: GatewayFilters = {};
  #max = 1000;

  constructor(token: string, intents: number){
    super();
    this.#wsm = new WebSocketManager({
      token,
      intents,
      shardCount: 1,
    });
    this.#wsm.on('event', (data: AnyEvent) => {
      const ev = data;
      if (!this.#passes(ev)) return;
      this.#queue.push(ev);
      if (this.#queue.length > this.#max) this.#queue.shift();
      this.emit('event', ev);
    });
  }

  start(){
    this.#wsm.connect();
  }

  setFilters(f: GatewayFilters){
    this.#filters = f;
  }

  getEvents(max = 50){
    return this.#queue.splice(0, Math.min(max, this.#queue.length));
  }

  info(){
    return { connected: this.#wsm.status === 0 || this.#wsm.status === 1 };
  }

  #passes(ev: AnyEvent): boolean {
    const f = this.#filters;
    if (f.eventTypes && f.eventTypes.length && !f.eventTypes.includes(ev.t)) return false;
    // Filter by guild/channel if IDs are present in payload (best-effort)
    const guildId = ev?.d?.guild_id ?? ev?.d?.guild?.id ?? null;
    if (f.guildIds && f.guildIds.length && guildId && !f.guildIds.includes(guildId)) return false;
    const channelId = ev?.d?.channel_id ?? ev?.d?.id ?? null;
    if (f.channelIds && f.channelIds.length && channelId && !f.channelIds.includes(channelId)) return false;
    return true;
  }
}
