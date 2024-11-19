import { AIInterface } from './ai-interface';
import { OpenAIProvider } from '../integrations/ai/openai';
import { AnthropicProvider } from '../integrations/ai/anthropic';
import { GitHubAIProvider } from '../integrations/ai/github';
import { logger } from '../utils/logger';

export class AIProviderRegistry {
  private providers: Map<string, AIInterface> = new Map();

  constructor() {
    this.registerDefaultProviders();
  }

  private registerDefaultProviders() {
    this.registerProvider('openai', new OpenAIProvider());
    this.registerProvider('anthropic', new AnthropicProvider());
    this.registerProvider('github', new GitHubAIProvider());
  }

  registerProvider(name: string, provider: AIInterface) {
    this.providers.set(name, provider);
    logger.info(`AI provider registered: ${name}`);
  }

  getProvider(name: string): AIInterface {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`AI provider not found: ${name}`);
    }
    return provider;
  }

  async findBestProvider(capabilities: string[]): Promise<AIInterface> {
    const capabilitiesSet = new Set(capabilities);
    
    for (const provider of this.providers.values()) {
      if (Array.from(capabilitiesSet).every(cap => 
        provider.supportedCapabilities.has(cap as any)
      )) {
        return provider;
      }
    }
    
    throw new Error('No suitable AI provider found for requested capabilities');
  }
}