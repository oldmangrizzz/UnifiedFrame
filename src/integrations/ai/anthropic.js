import Anthropic from '@anthropic-ai/sdk';
import { AIInterface, AIRequestSchema, AIResponseSchema } from '../../core/ai-interface.js';
import { logger } from '../../utils/logger.js';

export class AnthropicProvider extends AIInterface {
  constructor() {
    super();
    this.client = new Anthropic(process.env.ANTHROPIC_API_KEY);
  }

  async generate(request) {
    const validatedRequest = AIRequestSchema.parse(request);
    
    try {
      const completion = await this.client.messages.create({
        model: validatedRequest.model || 'claude-2',
        messages: [{ role: 'user', content: validatedRequest.prompt }],
        max_tokens: validatedRequest.maxTokens
      });

      return AIResponseSchema.parse({
        content: completion.content,
        metadata: {
          model: completion.model,
          stopReason: completion.stop_reason
        },
        usage: {
          promptTokens: completion.usage?.input_tokens || 0,
          completionTokens: completion.usage?.output_tokens || 0,
          totalTokens: (completion.usage?.input_tokens || 0) + (completion.usage?.output_tokens || 0)
        }
      });
    } catch (error) {
      logger.error('Anthropic API error:', error);
      throw error;
    }
  }
}