import { z } from 'zod';
const ALLOWED = new Set([
    'GET:/guilds/:guild_id/channels',
    'GET:/channels/:channel_id/messages',
    'POST:/channels/:channel_id/messages',
    'PATCH:/channels/:channel_id',
    'DELETE:/channels/:channel_id',
]);
export function rawRestTool(dc, enabled) {
    const input = z.object({
        method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
        route: z.string().describe('E.g., /channels/:channel_id/messages'),
        params: z.record(z.string()).default({}),
        body: z.any().optional()
    });
    return {
        name: 'discord.raw_rest',
        description: enabled ? 'Call a whitelisted Discord REST route directly.' : 'Disabled by server policy.',
        inputSchema: input,
        async *handler({ input }) {
            if (!enabled)
                throw new Error('raw_rest is disabled by policy');
            const { method, route, params, body } = input;
            const rest = dc['rest'];
            const key = `${method}:${route}`;
            if (!ALLOWED.has(key))
                throw new Error('Route not allowed');
            // Very light templating for :params
            let path = route;
            for (const [k, v] of Object.entries(params))
                path = path.replace(`:${k}`, String(v));
            const fn = method.toLowerCase();
            const res = await rest[fn](path.startsWith('/v10') ? path : `/v10${path}`, body ? { body } : {});
            yield { content: [{ type: 'json', text: JSON.stringify(res) }] };
        }
    };
}
