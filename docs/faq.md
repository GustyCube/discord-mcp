# FAQ

**Why a generator instead of hand-written tools?**  
Coverage + consistency. The model relies on tool names/descriptions/schemas, not HTTP details.

**Can I expose every Discord route?**  
Yes—append entries to the catalog. Keep dangerous ones behind `confirm` and packs.

**How do I add file uploads?**  
Use the `post_message_files` tool for base64 attachments, or add a route entry and handle `files` in a custom tool if needed.
