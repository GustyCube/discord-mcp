export class Policy {
    #cfg;
    constructor(cfg) {
        this.#cfg = cfg;
    }
    allowGuild(guildId) {
        const list = this.#cfg.allow.guildIds;
        return !list || list.length === 0 || list.includes(guildId);
    }
    allowChannel(channelId) {
        const list = this.#cfg.allow.channelIds;
        return !list || list.length === 0 || list.includes(channelId);
    }
    allowedMentions() {
        const p = this.#cfg.defaultAllowedMentions;
        switch (p) {
            case 'users': return { parse: ['users'] };
            case 'roles': return { parse: ['roles'] };
            case 'everyone': return { parse: ['everyone'] };
            case 'none':
            default:
                return { parse: [] };
        }
    }
}
