import { z } from 'zod';
import type { ToolHandler } from '../tool-types.js';

/**
 * Factory function to create type-safe tool handlers
 */
export function createToolHandler<TSchema extends z.ZodTypeAny>(config: {
  name: string;
  description: string;
  inputSchema: TSchema;
  handler: (input: z.infer<TSchema>) => AsyncGenerator<{ content: Array<{ type: string; text: string }> }>;
}): ToolHandler<TSchema> {
  return {
    name: config.name,
    description: config.description,
    inputSchema: config.inputSchema,
    async *handler({ input }) {
      const validated = config.inputSchema.parse(input);
      yield* config.handler(validated);
    }
  };
}