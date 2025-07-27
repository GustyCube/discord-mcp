import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';

export type ToolDoc = {
  name: string;
  description: string;
  aliases?: string[];
  pack: string;
  path: string;
  method: string;
  example?: string;
};

export function searchToolsTool(index: ToolDoc[]): ToolHandler {
  const input = z.object({ query: z.string() });
  return {
    name: 'discord.search_tools',
    description: 'Search Discord tools by name/alias/description.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const q = (input as any).query.toLowerCase();
      const hits = index.filter(t => t.name.toLowerCase().includes(q) || (t.aliases||[]).some(a=>a.toLowerCase().includes(q)) || t.description.toLowerCase().includes(q));
      yield { content: [{ type: 'json', text: JSON.stringify(hits) }] };
    }
  };
}

export function helpTool(index: ToolDoc[]): ToolHandler {
  const input = z.object({ tool_name: z.string() });
  return {
    name: 'discord.help',
    description: 'Show details and a usage example for a tool.',
    inputSchema: input,
    async *handler({ input }: { input: any }){
      const name = (input as any).tool_name;
      const item = index.find(t => t.name === name);
      if (!item) {
        yield { content: [{ type: 'text', text: 'Not found' }] };
        return;
      }
      const md = `### ${item.name}\n${item.description}\n\n**Method/Path:** \`${item.method} ${item.path}\`\n**Pack:** ${item.pack}\n**Aliases:** ${(item.aliases||[]).join(', ') || '—'}\n\n**Example**\n\n\`${item.example || '(coming soon)'}\``;
      yield { content: [{ type: 'text', text: md }] };
    }
  };
}

export function toolsIndexTool(index: ToolDoc[]): ToolHandler {
  const input = z.object({});
  return {
    name: 'discord.tools_index',
    description: 'Emit a Markdown index of all available Discord tools.',
    inputSchema: input,
    async *handler(){
      const byPack: Record<string, ToolDoc[]> = {};
      for (const t of index) (byPack[t.pack] ||= []).push(t);
      const packs = Object.keys(byPack).sort();
      let md = '# Discord Tools Index\n';
      for (const p of packs) {
        md += `\n## ${p}\n`;
        for (const t of byPack[p]) {
          md += `- **${t.name}** — ${t.description} _(aliases: ${(t.aliases||[]).join(', ') || '—'})_\n`;
        }
      }
      yield { content: [{ type: 'text', text: md }] };
    }
  };
}
