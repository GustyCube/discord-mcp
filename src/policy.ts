import type { APIChannel } from 'discord-api-types/v10';
import type { DiscordClient } from './discord.js';
import type { ServerConfig } from './types.js';

export class Policy {
  #cfg: ServerConfig;
  constructor(cfg: ServerConfig){
    this.#cfg = cfg;
  }
  allowGuild(guildId: string){
    const list = this.#cfg.allow.guildIds;
    return !list || list.length===0 || list.includes(guildId);
  }
  allowChannel(channelId: string){
    const list = this.#cfg.allow.channelIds;
    return !list || list.length===0 || list.includes(channelId);
  }
  async allowChannelResolved(dc: DiscordClient, channelId: string){
    if (this.allowChannel(channelId)) return true;

    const channel = await dc.getChannel(channelId) as APIChannel & { parent_id?: string | null; guild_id?: string | null };
    if (channel.guild_id && !this.allowGuild(channel.guild_id)) return false;

    return Boolean(channel.parent_id && this.allowChannel(channel.parent_id));
  }
  allowedMentions(){
    const p = this.#cfg.defaultAllowedMentions;
    switch(p){
      case 'users': return { parse: ['users'] as const };
      case 'roles': return { parse: ['roles'] as const };
      case 'everyone': return { parse: ['everyone'] as const };
      case 'none':
      default:
        return { parse: [] as const };
    }
  }
}
