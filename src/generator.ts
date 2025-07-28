import { z } from 'zod';
import type { ToolHandler } from './tool-types.js';
import { REST } from '@discordjs/rest';
import { request } from 'undici';
import type { Policy } from './policy.js';
import { DiscordClient } from './discord.js';

type CatalogEntry = {
  name: string;
  aliases?: string[];
  method: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE';
  path: string; // e.g., /channels/:channel_id/messages
  description: string;
  pack?: 'CORE'|'ADMIN'|'MEDIA'|'COMMUNITY'|'DEVTOOLS';
  confirm?: boolean;
  schema: any; // JSON Schema subset
};

function jsonSchemaToZod(schema: any): z.ZodTypeAny {
  const t = schema.type;
  if (t === 'string') return z.string();
  if (t === 'integer' || t === 'number') {
    let base = z.number();
    if (schema.type === 'integer') base = z.number().int();
    if (schema.minimum !== undefined) base = base.min(schema.minimum);
    if (schema.maximum !== undefined) base = base.max(schema.maximum);
    return base;
  }
  if (t === 'boolean') return z.boolean();
  if (t === 'array') {
    const items = schema.items ? jsonSchemaToZod(schema.items) : z.any();
    return z.array(items);
  }
  if (t === 'object') {
    const props = schema.properties || {};
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const [k,v] of Object.entries(props)) shape[k] = jsonSchemaToZod(v);
    const base = z.object(shape);
    const req = schema.required || [];
    return base.superRefine((data, ctx)=>{
      for (const r of req) if (data[r] === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Missing required field: ${r}` });
    });
  }
  return z.any();
}

function replacePathParams(path: string, params: Record<string,string>){
  let out = path;
  for (const [k,v] of Object.entries(params)) {
    // Use simple string replacement instead of regex for better performance
    const placeholder = `:${k}`;
    const encoded = encodeURIComponent(String(v));
    // Replace all occurrences
    while (out.includes(placeholder)) {
      out = out.replace(placeholder, encoded);
    }
  }
  return out;
}

function pickParamsForPath(path: string): string[] {
  const re = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
  const ids: string[] = [];
  let m; while ((m = re.exec(path))) ids.push(m[1]);
  return ids;
}

export type GeneratedTool = { handler: ToolHandler, entry: CatalogEntry };

export function generateTools(catalog: CatalogEntry[], dc: DiscordClient, policy: Policy, options: {
  packsEnabled: Set<string>,
  defaultAllowedMentions: any
}): GeneratedTool[] {
  const rest = dc.getRest();
  const tools: GeneratedTool[] = [];
  for (const entry of catalog) {
    const pack = entry.pack ?? 'CORE';
    if (!options.packsEnabled.has(pack)) continue;

    // Build schema: path params + the schema's properties
    const pathParams = pickParamsForPath(entry.path);
    const baseSchema = entry.schema ?? { type: 'object', properties: {} };
    
    // Create a single z.object with all properties merged
    const allProperties: Record<string, z.ZodTypeAny> = {};
    
    // Add path parameters as required strings
    for (const param of pathParams) {
      allProperties[param] = z.string();
    }
    
    // Add body schema properties  
    if (baseSchema.type === 'object' && baseSchema.properties) {
      const requiredFields = new Set(baseSchema.required || []);
      for (const [key, value] of Object.entries(baseSchema.properties)) {
        let zodSchema = jsonSchemaToZod(value);
        // Make field optional if it's not in the required array
        if (!requiredFields.has(key)) {
          zodSchema = zodSchema.optional();
        }
        allProperties[key] = zodSchema;
      }
    }
    
    const inputSchema = z.object(allProperties);

    const name = entry.name;
    const confirmDefault = Boolean(entry.confirm);
    const desc = `${entry.description}${entry.aliases?.length ? ` Aliases: ${entry.aliases.join(', ')}` : ''}${confirmDefault ? ' (confirm=true by default)' : ''}`;

    const handler: ToolHandler = {
      name,
      description: desc,
      inputSchema: inputSchema,
      async *handler({ input }) {
        const data = input;
        // Allow-lists (best-effort): block if channel_id/guild_id present and not allowed
        if (data.channel_id && !policy.allowChannel(String(data.channel_id))) throw new Error('Channel not allowed by policy');
        if (data.guild_id && !policy.allowGuild(String(data.guild_id))) throw new Error('Guild not allowed by policy');

        // Preview gate
        const confirm = ('confirm' in data) ? Boolean(data.confirm) : confirmDefault;
        if (confirm) {
          const preview = { method: entry.method, path: entry.path, input: data };
          yield { content: [{ type: 'text', text: `Preview:\n${JSON.stringify(preview, null, 2)}\n(Resend with {confirm:false} to execute)` }] };
          return;
        }

        // Build path and separate body vs path/query (simple heuristic: if field is in path, it's a path param; some GETs support query subset explicit in schema - we just pass everything else as query for GET, body otherwise)
        const params: Record<string,string> = {};
        for (const p of pathParams) if (data[p] !== undefined) params[p] = String(data[p]);
        const apiPath = replacePathParams(entry.path, params);
        const restOptions: any = {};

        // Remove path params and confirm from payload
        const payload: any = { ...data };
        for (const p of pathParams) delete payload[p];
        delete payload['confirm'];

        if (entry.method === 'GET' || entry.method === 'DELETE') {
          if (Object.keys(payload).length) restOptions.query = payload;
        } else {
          // Special-case allowed_mentions default for message posts
          if (name.startsWith('discord_post_message') || name === 'discord_reply' || apiPath.includes('/messages')) {
            // Validate allowed_mentions if provided by user
            if (payload.allowed_mentions && typeof payload.allowed_mentions === 'object') {
              const am = payload.allowed_mentions;
              // Ensure parse array contains only valid values
              if (am.parse && Array.isArray(am.parse)) {
                const validParse = ['users', 'roles', 'everyone'];
                am.parse = am.parse.filter((p: string) => validParse.includes(p));
              }
              // Ensure arrays are actually arrays of strings
              if (am.users && !Array.isArray(am.users)) delete am.users;
              if (am.roles && !Array.isArray(am.roles)) delete am.roles;
            }
            payload.allowed_mentions = payload.allowed_mentions ?? options.defaultAllowedMentions;
          }
          restOptions.body = payload;
        }

        const route = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
        const verb = entry.method.toLowerCase() as 'get' | 'post' | 'patch' | 'put' | 'delete';
        
        const result = await rest[verb](route as `/${string}`, restOptions) as any;
        yield { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
    };

    tools.push({ handler, entry });
  }
  return tools;
}
