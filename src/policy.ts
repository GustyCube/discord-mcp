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
