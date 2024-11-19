import { z } from 'zod';
import { IdentityManager } from './identity/manager';

// ... (previous AICapability enum and schemas)

export abstract class AIInterface {
  protected identityManager?: IdentityManager;

  abstract get capabilities(): Set<keyof typeof AICapability>;
  
  setIdentityManager(manager: IdentityManager) {
    this.identityManager = manager;
  }

  protected async enrichRequestWithIdentity(request: AIRequest): Promise<AIRequest> {
    if (!this.identityManager || !request.metadata?.identityId) {
      return request;
    }

    const systemPrompt = await this.identityManager.getSystemPrompt(
      request.metadata.identityId
    );

    return {
      ...request,
      metadata: {
        ...request.metadata,
        systemPrompt
      }
    };
  }
  
  abstract generate(request: AIRequest): Promise<AIResponse>;
  abstract stream?(request: AIRequest): AsyncIterableIterator<AIResponse>;
  abstract embeddings?(text: string): Promise<number[]>;
  
  async validate(request: AIRequest): Promise<boolean> {
    const requestedCapabilities = new Set(request.capabilities);
    const supportedCapabilities = this.capabilities;
    
    return Array.from(requestedCapabilities).every(cap => 
      supportedCapabilities.has(cap as keyof typeof AICapability)
    );
  }
}