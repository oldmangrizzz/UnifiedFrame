import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIInterface, AIRequest, AIResponse, AICapability } from '../../core/ai-interface';
import { QuirksAdapter } from '../../core/quirks/adapter';
import { logger } from '../../utils/logger';

export class GeminiProvider extends AIInterface {
  private client: GoogleGenerativeAI;
  private quirksAdapter: QuirksAdapter;
  private capabilities = new Set([
    AICapability.TEXT_GENERATION,
    AICapability.CODE_GENERATION,
    AICapability.CHAT,
    AICapability.FUNCTION_CALLING
  ]);

  constructor(quirksAdapter: QuirksAdapter) {
    super();
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);
    this.quirksAdapter = quirksAdapter;
  }

  get supportedCapabilities(): Set<keyof typeof AICapability> {
    return this.capabilities;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    try {
      // Enrich request with identity if specified
      const enrichedRequest = await this.enrichRequestWithIdentity(request);
      
      const model = this.client.getGenerativeModel({ 
        model: 'gemini-1.0-pro',
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });

      // Include system prompt in generation if available
      const prompt = enrichedRequest.metadata?.systemPrompt
        ? `${enrichedRequest.metadata.systemPrompt}\n\n${enrichedRequest.prompt}`
        : enrichedRequest.prompt;

      const result = await model.generateContent(prompt);
      const response = result.response;

      const baseResponse: AIResponse = {
        content: response.text(),
        metadata: {
          model: 'gemini-1.0-pro',
          provider: 'google',
          identityId: enrichedRequest.metadata?.identityId
        },
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        },
        capabilities: Array.from(this.capabilities)
      };

      // Apply quirks if persona is specified
      if (request.metadata?.personaId) {
        return await this.quirksAdapter.applyQuirks(
          request.metadata.personaId,
          baseResponse
        );
      }

      return baseResponse;
    } catch (error) {
      logger.error('Gemini API error:', error);
      throw error;
    }
  }
}