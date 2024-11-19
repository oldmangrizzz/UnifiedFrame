import { AIInterface, AIRequest, AIResponse, AICapability } from '../../core/ai-interface';
import { Agent, AgentManager } from '../../core/agent-manager';
import { logger } from '../../utils/logger';

export class AgencySwarmAdapter extends AIInterface {
  private capabilities = new Set([
    AICapability.TEXT_GENERATION,
    AICapability.CHAT,
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
      // Transform to Agency Swarm format
      const swarmRequest = this.transformRequest(request);
      
      // Execute through swarm coordination
      const responses = await this.agentManager.collaborativeExecute(swarmRequest);
      
      return this.transformResponse(responses);
    } catch (error) {
      logger.error('Agency Swarm execution error:', error);
      throw error;
    }
  }

  private transformRequest(request: AIRequest): AIRequest {
    return {
      ...request,
      metadata: {
        ...request.metadata,
        framework: 'agency-swarm',
        swarmConfig: this.config.swarm || {}
      }
    };
  }

  private transformResponse(responses: AIResponse[]): AIResponse {
    // Aggregate swarm responses with voting/consensus
    const consensusContent = this.reachConsensus(responses);

    return {
      content: consensusContent,
      metadata: {
        framework: 'agency-swarm',
        swarmSize: responses.length,
        consensusMethod: 'majority-vote'
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

  private reachConsensus(responses: AIResponse[]): string {
    // Implement swarm consensus algorithm
    // This is a simplified version - you might want to implement more sophisticated voting
    const responseMap = new Map<string, number>();
    
    responses.forEach(response => {
      const count = responseMap.get(response.content) || 0;
      responseMap.set(response.content, count + 1);
    });

    let maxCount = 0;
    let consensusResponse = '';

    for (const [response, count] of responseMap.entries()) {
      if (count > maxCount) {
        maxCount = count;
        consensusResponse = response;
      }
    }

    return consensusResponse;
  }
}