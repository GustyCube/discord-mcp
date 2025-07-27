import { z, ZodRawShape } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js';

// Define the tool handler type that matches what the tools are returning
export interface ToolHandler<Args extends ZodRawShape = any> {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  handler: (args: { input: any }) => AsyncGenerator<{ content: Array<{ type: string; text: string }> }>;
}