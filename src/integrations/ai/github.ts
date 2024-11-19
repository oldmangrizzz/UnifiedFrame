import { Octokit } from '@octokit/rest';
import { AIInterface, AIRequest, AIResponse, AICapability } from '../../core/ai-interface';
import { logger } from '../../utils/logger';

export class GitHubAIProvider extends AIInterface {
  private octokit: Octokit;
  private capabilities = new Set([
    AICapability.TEXT_GENERATION,
    AICapability.CODE_GENERATION,
    AICapability.CHAT,
    AICapability.FUNCTION_CALLING
  ]);

  constructor() {
    super();
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
  }

  get supportedCapabilities(): Set<keyof typeof AICapability> {
    return this.capabilities;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    try {
      // Call GitHub's Copilot API endpoint
      const response = await this.octokit.request('POST /api/v1/copilot/completions', {
        headers: {
          'copilot-access-token': process.env.GITHUB_COPILOT_TOKEN,
          'azure-gpt4-token': process.env.AZURE_GPT4_TOKEN
        },
        body: {
          prompt: request.prompt,
          max_tokens: request.maxTokens || 1000,
          temperature: request.temperature || 0.7,
          model: 'gpt-4' // or other available models
        }
      });

      return {
        content: response.data.choices[0].text,
        metadata: {
          model: 'github-copilot-gpt4',
          provider: 'github',
          finishReason: response.data.choices[0].finish_reason
        },
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens
        },
        capabilities: Array.from(this.capabilities)
      };
    } catch (error) {
      logger.error('GitHub AI API error:', error);
      throw error;
    }
  }

  async stream(request: AIRequest): Promise<AsyncIterableIterator<AIResponse>> {
    try {
      const response = await this.octokit.request('POST /api/v1/copilot/completions.stream', {
        headers: {
          'copilot-access-token': process.env.GITHUB_COPILOT_TOKEN,
          'azure-gpt4-token': process.env.AZURE_GPT4_TOKEN
        },
        body: {
          prompt: request.prompt,
          max_tokens: request.maxTokens || 1000,
          temperature: request.temperature || 0.7,
          model: 'gpt-4',
          stream: true
        }
      });

      return this.processStream(response);
    } catch (error) {
      logger.error('GitHub AI streaming error:', error);
      throw error;
    }
  }

  private async *processStream(response: any): AsyncIterableIterator<AIResponse> {
    for await (const chunk of response.data) {
      if (chunk.choices?.[0]?.text) {
        yield {
          content: chunk.choices[0].text,
          metadata: {
            model: 'github-copilot-gpt4',
            provider: 'github',
            streaming: true
          },
          usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0
          },
          capabilities: Array.from(this.capabilities)
        };
      }
    }
  }
}