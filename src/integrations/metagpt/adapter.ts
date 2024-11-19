import { AIInterface, AIRequest, AIResponse, AICapability } from '../../core/ai-interface';
import { Agent, AgentManager } from '../../core/agent-manager';
import { logger } from '../../utils/logger';

export class MetaGPTAdapter extends AIInterface {
  private capabilities = new Set([
    AICapability.TEXT_GENERATION,
    AICapability.CODE_GENERATION,
    AICapability.FUNCTION_CALLING
  ]);

  constructor(
    private agentManager: AgentManager,
    private config: Record<string, any>
  ) {}

  get supportedCapabilities(): Set<keyof typeof AICapability> {
    return this.capabilities;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    try {
      // Transform request to MetaGPT format
      const metaGPTRequest = this.transformRequest(request);
      
      // Execute through agent manager for coordination
      const responses = await this.agentManager.collaborativeExecute(metaGPTRequest);
      
      // Combine and transform responses
      return this.transformResponse(responses);
    } catch (error) {
      logger.error('MetaGPT execution error:', error);
      throw error;
    }
  }

  private transformRequest(request: AIRequest): AIRequest {
    return {
      ...request,
      metadata: {
        ...request.metadata,
        framework: 'metagpt',
        roles: this.config.roles || []
      }
    };
  }

  private transformResponse(responses: AIResponse[]): AIResponse {
    // Combine multiple agent responses into a single coherent response
    const combinedContent = responses
      .map(r => r.content)
      .join('\n\n');

    return {
      content: combinedContent,
      metadata: {
        framework: 'metagpt',
        agentCount: responses.length
      },
      usage: responses.reduce(
        (acc, r) => ({
          promptTokens: acc.promptTokens + r.usage.promptTokens,
          completionTokens: acc.completionTokens + r.usage.completionTokens,
          totalTokens: acc.totalTokens + r.usage.totalTokens
        }),
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
      ),
      capabilities: Array.from(this.capabilities)
    };
  }
}