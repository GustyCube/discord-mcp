/**
 * Base error class for Discord MCP operations
 */
export class DiscordMCPError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'DiscordMCPError';
  }
}

/**
 * Error thrown when a resource is not allowed by policy
 */
export class PolicyError extends DiscordMCPError {
  constructor(resource: string, resourceId: string) {
    super(
      `${resource} not allowed by policy`,
      'POLICY_VIOLATION',
      { resource, resourceId }
    );
    this.name = 'PolicyError';
  }
}

/**
 * Error thrown when a Discord API request fails
 */
export class DiscordAPIError extends DiscordMCPError {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      'DISCORD_API_ERROR',
      { ...context, status, endpoint }
    );
    this.name = 'DiscordAPIError';
  }
}