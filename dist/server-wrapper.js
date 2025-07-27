import { Server } from '@modelcontextprotocol/sdk/server/index.js';
// Extend the Server class to add tool registration functionality
export class ExtendedServer extends Server {
    _toolHandlers = new Map();
    constructor(serverInfo, options) {
        super(serverInfo, options);
        // Register the handler for tools/list
        this.setRequestHandler('tools/list', async () => {
            const tools = Array.from(this._toolHandlers.values()).map(tool => ({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema.shape
            }));
            return { tools };
        });
        // Register the handler for tools/call
        this.setRequestHandler('tools/call', async (request) => {
            const { name, arguments: args } = request.params;
            const tool = this._toolHandlers.get(name);
            if (!tool) {
                throw new Error(`Tool ${name} not found`);
            }
            // Validate input
            const validatedInput = tool.inputSchema.parse(args || {});
            // Execute the tool handler
            const result = tool.handler({ input: validatedInput });
            // Collect all yielded content
            const contents = [];
            for await (const output of result) {
                if (output.content) {
                    contents.push(...output.content);
                }
            }
            return {
                content: contents
            };
        });
    }
    // Add the tool method
    tool(handler) {
        this._toolHandlers.set(handler.name, handler);
        // Update capabilities
        const currentCapabilities = this._capabilities || {};
        this.registerCapabilities({
            ...currentCapabilities,
            tools: {}
        });
    }
}
