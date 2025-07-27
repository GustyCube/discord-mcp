# Route Generator

Catalog file: `src/catalog/discord.routes.json`

Each entry:
```json
{
  "name": "discord.post_message",
  "aliases": ["send message"],
  "method": "POST",
  "path": "/channels/:channel_id/messages",
  "description": "Post a message to a channel.",
  "pack": "CORE",
  "confirm": true,
  "schema": {
    "type": "object",
    "properties": {
      "channel_id": {"type":"string"},
      "content": {"type":"string"}
    },
    "required": ["channel_id","content"]
  }
}
```

- `confirm: true` shows a preview; call again with `confirm:false` to execute.
- Path params like `:channel_id` are required and merged into the request path.
- For `GET/DELETE` non-path fields become `query`; for others they become `body`.
- Messages auto-apply `allowed_mentions` from policy unless you override.

Helper tools:
- `discord.search_tools(query)`
- `discord.help(tool_name)`
- `discord.tools_index()`
