# API Reference

Discord MCP provides a comprehensive set of tools for interacting with the Discord API through the Model Context Protocol.

## Core Tools

These tools are always available:

### Message Management
- `discord.post_message` - Send a message to a channel
- `discord.fetch_messages` - Retrieve messages from a channel
- `discord.reply` - Reply to a specific message
- `discord.add_reaction` - Add a reaction to a message
- `discord.remove_reaction` - Remove a reaction from a message

### Channel Operations
- `discord.list_channels` - List all channels in accessible guilds
- `discord.create_thread` - Create a new thread in a channel

### User Interactions
- `discord.get_user` - Get user information
- `discord.dm_user` - Send a direct message to a user

## Admin Pack Tools

Enable with `PACK_ADMIN=1`:

### Guild Management
- `discord.list_bans` - List banned users in a guild
- `discord.ban_user` - Ban a user from a guild
- `discord.unban_user` - Unban a user from a guild

### Role Management
- `discord.list_roles` - List all roles in a guild
- `discord.create_role` - Create a new role
- `discord.delete_role` - Delete a role
- `discord.add_role` - Add a role to a member
- `discord.remove_role` - Remove a role from a member

### Channel Administration
- `discord.create_channel` - Create a new channel
- `discord.edit_channel` - Edit channel properties
- `discord.delete_channel` - Delete a channel

## Media Pack Tools

Enable with `PACK_MEDIA=1`:

- `discord.post_message_with_files` - Send messages with file attachments
- `discord.list_emojis` - List custom emojis in a guild
- `discord.create_emoji` - Create a custom emoji
- `discord.delete_emoji` - Delete a custom emoji

## Community Pack Tools

Enable with `PACK_COMMUNITY=1`:

- `discord.list_scheduled_events` - List guild scheduled events
- `discord.create_scheduled_event` - Create a scheduled event
- `discord.delete_scheduled_event` - Delete a scheduled event

## Gateway Tools

Real-time event handling:

- `discord.gateway_subscribe` - Subscribe to specific event types
- `discord.gateway_get` - Retrieve queued events
- `discord.gateway_info` - Get gateway connection status

## Tool Response Format

All tools return responses in a consistent format:

```typescript
{
  content: Array<{
    type: 'text' | 'json';
    text: string;
  }>
}
```

For detailed parameter information for each tool, use the `discord.help` tool:

```
discord.help({ tool_name: "discord.post_message" })
```