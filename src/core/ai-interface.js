import { z } from 'zod';

export const AIRequestSchema = z.object({
  prompt: z.string(),
  context: z.record(z.any()).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional()
});

export const AIResponseSchema = z.object({
  content: z.string(),
  metadata: z.record(z.any()),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number()
  })
});

export class AIInterface {
  async generate(request) {
    throw new Error('Method not implemented');
  }

  async stream(request) {
    throw new Error('Method not implemented');
  }

  async embeddings(text) {
    throw new Error('Method not implemented');
  }
}