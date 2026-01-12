import { GatewayIntentBits, type GatewayDispatchEvents } from '@discordjs/core';
import { WebSocketManager } from '@discordjs/ws';
import { EventEmitter } from 'node:events';
import { REST } from '@discordjs/rest';

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
    const rest = new REST({ version: '10' }).setToken(token);
    this.#wsm = new WebSocketManager({
      token,
      intents,
      shardCount: 1,
      rest
    });

    this.#wsm.on('ready', () => {
      console.error(`Gateway connected (intents: ${intents})`);
    });
    this.#wsm.on('error', (error: any) => {
      console.error(`Gateway error:`, error);
    });

    // Use 'dispatch' event name (WebSocketShardEvents.Dispatch = "dispatch")
    // Payload structure: { data: GatewayDispatchPayload; shardId: number; }
    this.#wsm.on('dispatch', (payload: { data: any; shardId: number }) => {
      try {
        // The dispatch payload has the actual gateway event in payload.data
        // payload.data has: t (type), d (data), s (sequence), op (opcode)
        const ev: AnyEvent = {
          t: payload.data.t,
          d: payload.data.d,
          s: payload.data.s,
          op: payload.data.op,
          shard: payload.shardId
        };
        if (!this.#passes(ev)) return;
        this.#queue.push(ev);
        // Fix memory leak: remove excess events from the beginning of the queue
        if (this.#queue.length > this.#max) {
          this.#queue.splice(0, this.#queue.length - this.#max);
        }
        this.emit('event', ev);
      } catch (error) {
        console.error('Gateway event processing error:', error);
        this.emit('error', error);
      }
    });
  }

  start(){
    this.#wsm.connect();
  }

  stop(){
    this.#wsm.destroy();
    this.#queue = [];
    this.removeAllListeners();
  }

  setFilters(f: GatewayFilters){
    this.#filters = f;
  }

  getEvents(max = 50){
    return this.#queue.splice(0, Math.min(max, this.#queue.length));
  }

  info(){
    // WebSocketManager doesn't expose a status property directly
    // We'll use a simple connected flag for now
    return { connected: true };
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
