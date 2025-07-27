# Examples

## Post a message (preview then send)
1) Preview:
```json
{ "tool": "discord.post_message", "input": { "channel_id": "123", "content": "Hello world!" } }
```
2) Execute:
```json
{ "tool": "discord.post_message", "input": { "channel_id": "123", "content": "Hello world!", "confirm": false } }
```

## Reply to a message
```json
{ "tool": "discord.reply", "input": { "channel_id": "123", "message_id": "456", "content": "On it.", "confirm": false } }
```

## Add a reaction
```json
{ "tool": "discord.add_reaction", "input": { "channel_id": "123", "message_id": "456", "emoji": "👍" } }
```

## Create an invite
```json
{ "tool": "discord.create_invite", "input": { "channel_id": "123", "max_age": 86400, "max_uses": 1 } }
```

## Create a webhook, then execute it
```json
{ "tool": "discord.webhook_create", "input": { "channel_id": "123", "name": "Build Bot" } }
```
*(Store the token securely)*
```json
{ "tool": "discord.webhook_execute", "input": { "webhook_id": "999", "token": "xxxxx", "content": "Deployed ✅" } }
```

## Gateway: subscribe and fetch events
```json
{ "tool": "discord.gateway_subscribe", "input": { "event_types": ["MESSAGE_CREATE"], "channel_ids": ["123"] } }
```
```json
{ "tool": "discord.gateway_get_events", "input": { "max": 50 } }
```

## Ban & unban (destructive; preview then send)
```json
{ "tool": "discord.ban_user", "input": { "guild_id": "42", "user_id": "777", "delete_message_seconds": 3600 } }
```
```json
{ "tool": "discord.ban_user", "input": { "guild_id": "42", "user_id": "777", "delete_message_seconds": 3600, "confirm": false } }
```
```json
{ "tool": "discord.unban_user", "input": { "guild_id": "42", "user_id": "777", "confirm": false } }
```

## Create a forum post with tags
```json
{ "tool": "discord.create_forum_post", "input": { "channel_id": "123", "name": "Feedback", "message": { "content": "Share your thoughts" }, "applied_tags": ["tag-id-1"] , "confirm": false } }
```

## Search tools / Help / Index
```json
{ "tool": "discord.search_tools", "input": { "query": "invite" } }
```
```json
{ "tool": "discord.help", "input": { "tool_name": "discord.create_invite" } }
```
```json
{ "tool": "discord.tools_index", "input": {} }
```


## Get invite by code
```json
{ "tool": "discord.get_invite", "input": { "code": "abc123", "with_counts": true, "with_expiration": true } }
```

## List active threads (guild)
```json
{ "tool": "discord.list_active_threads_guild", "input": { "guild_id": "42" } }
```

## Modify a stage instance (preview then execute)
```json
{ "tool": "discord.modify_stage_instance", "input": { "channel_id": "999", "topic": "Town Hall" } }
```
```json
{ "tool": "discord.modify_stage_instance", "input": { "channel_id": "999", "topic": "Town Hall", "confirm": false } }
```

## List guild webhooks
```json
{ "tool": "discord.list_guild_webhooks", "input": { "guild_id": "42" } }
```

## Get a specific guild ban
```json
{ "tool": "discord.get_guild_ban", "input": { "guild_id": "42", "user_id": "777" } }
```

## Sticker packs and sticker info
```json
{ "tool": "discord.list_sticker_packs", "input": {} }
```
```json
{ "tool": "discord.get_sticker", "input": { "sticker_id": "1234567890" } }
```

## Linked Roles metadata (DEVTOOLS)
```json
{ "tool": "discord.set_role_connections_metadata", "input": { "application_id": "app_123", "metadata": [{ "key":"level", "name":"Level", "description":"Player level", "type": 7 }] } }
```


## Get original interaction response
```json
{ "tool": "discord.get_original_interaction_response", "input": { "application_id": "app_123", "interaction_token": "token_abc" } }
```

## Guild preview
```json
{ "tool": "discord.get_guild_preview", "input": { "guild_id": "42" } }
```

## Get scheduled event
```json
{ "tool": "discord.get_scheduled_event", "input": { "guild_id": "42", "event_id": "999" } }
```

## Bulk overwrite commands (global)
```json
{ "tool": "discord.bulk_overwrite_commands_global", "input": { "application_id": "app_123", "commands": [{ "name":"ping", "description":"pong", "type":1 }] } }
```

## Get single command (guild)
```json
{ "tool": "discord.get_command_guild", "input": { "application_id": "app_123", "guild_id": "42", "command_id": "cmd_777" } }
```

## Linked Roles metadata (GET)
```json
{ "tool": "discord.get_role_connections_metadata", "input": { "application_id": "app_123" } }
```
