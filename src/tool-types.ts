import { z, ZodRawShape } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js';

// Define the tool handler type that matches what the tools are returning
export interface ToolHandler<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  description: string;
  inputSchema: TSchema;
  handler: (args: { input: z.infer<TSchema> }) => AsyncGenerator<{ content: Array<{ type: string; text: string }> }>;
}