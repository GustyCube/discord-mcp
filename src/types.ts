export type AllowConfig = {
  guildIds?: string[];
  channelIds?: string[];
};

export type PostPolicy = 'none' | 'users' | 'roles' | 'everyone';

export interface ServerConfig {
  allow: AllowConfig;
  defaultAllowedMentions: PostPolicy;
}
