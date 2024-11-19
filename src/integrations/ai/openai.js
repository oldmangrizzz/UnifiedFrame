import OpenAI from 'openai';
import { AIInterface, AIRequestSchema, AIResponseSchema } from '../../core/ai-interface.js';
import { logger } from '../../utils/logger.js';

export class OpenAIProvider extends AIInterface {
  constructor() {
    super();
    this.client = new OpenAI(process.env.OPENAI_API_KEY);
  }

  async generate(request) {
    const validatedRequest = AIRequestSchema.parse(request);
    
    try {
      const completion = await this.client.chat.completions.create({
        model: validatedRequest.model || 'gpt-4',
        messages: [{ role: 'user', content: validatedRequest.prompt }],
        temperature: validatedRequest.temperature || 1,
        max_tokens: validatedRequest.maxTokens
      });

      return AIResponseSchema.parse({
        content: completion.choices[0].message.content,
        metadata: {
          model: completion.model,
          finishReason: completion.choices[0].finish_reason
        },
        usage: {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens
        }
      });
    } catch (error) {
      logger.error('OpenAI API error:', error);
      throw error;
    }
  }

  async stream(request) {
    const validatedRequest = AIRequestSchema.parse(request);
    
    try {
      const stream = await this.client.chat.completions.create({
        model: validatedRequest.model || 'gpt-4',
        messages: [{ role: 'user', content: validatedRequest.prompt }],
        temperature: validatedRequest.temperature || 1,
        max_tokens: validatedRequest.maxTokens,
        stream: true
      });

      return stream;
    } catch (error) {
      logger.error('OpenAI streaming error:', error);
      throw error;
    }
  }

  async embeddings(text) {
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      });
      
      return response.data[0].embedding;
    } catch (error) {
      logger.error('OpenAI embeddings error:', error);
      throw error;
    }
  }
}