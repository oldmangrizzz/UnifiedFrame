import { EventEmitter } from 'events';
import { z } from 'zod';
import { AIInterface, AIRequest, AIResponse } from '../ai-interface';
import { logger } from '../../utils/logger';

export const QuirkSchema = z.object({
  id: z.string(),
  type: z.enum(['tone', 'mannerism', 'phrase', 'behavior']),
  value: z.string(),
  context: z.array(z.string()),
  weight: z.number().min(0).max(1),
  metadata: z.record(z.any()).optional()
});

export type Quirk = z.infer<typeof QuirkSchema>;

export class QuirksAdapter extends EventEmitter {
  private quirks: Map<string, Quirk[]> = new Map();
  private modelAdapters: Map<string, AIInterface> = new Map();

  constructor() {
    super();
    this.initializeEvents();
  }

  private initializeEvents() {
    this.on('quirk:applied', (personaId: string, quirk: Quirk) => {
      logger.info(`Applied quirk ${quirk.id} to persona ${personaId}`);
    });
  }

  async applyQuirks(personaId: string, response: AIResponse): Promise<AIResponse> {
    const personaQuirks = this.quirks.get(personaId) || [];
    let modifiedContent = response.content;

    for (const quirk of personaQuirks) {
      modifiedContent = await this.applyQuirk(quirk, modifiedContent, response.metadata);
    }

    return {
      ...response,
      content: modifiedContent,
      metadata: {
        ...response.metadata,
        appliedQuirks: personaQuirks.map(q => q.id)
      }
    };
  }

  private async applyQuirk(
    quirk: Quirk, 
    content: string, 
    metadata: Record<string, any>
  ): Promise<string> {
    switch (quirk.type) {
      case 'tone':
        return this.applyToneQuirk(quirk, content);
      case 'mannerism':
        return this.applyMannerismQuirk(quirk, content);
      case 'phrase':
        return this.applyPhraseQuirk(quirk, content);
      case 'behavior':
        return this.applyBehaviorQuirk(quirk, content, metadata);
      default:
        return content;
    }
  }

  private async applyToneQuirk(quirk: Quirk, content: string): Promise<string> {
    // Implement tone modification logic
    return content;
  }

  private async applyMannerismQuirk(quirk: Quirk, content: string): Promise<string> {
    // Implement mannerism application logic
    return content;
  }

  private async applyPhraseQuirk(quirk: Quirk, content: string): Promise<string> {
    // Implement signature phrase insertion logic
    return content;
  }

  private async applyBehaviorQuirk(
    quirk: Quirk, 
    content: string, 
    metadata: Record<string, any>
  ): Promise<string> {
    // Implement behavior modification logic
    return content;
  }

  registerQuirk(personaId: string, quirk: Quirk) {
    const existing = this.quirks.get(personaId) || [];
    this.quirks.set(personaId, [...existing, quirk]);
  }

  registerModelAdapter(model: string, adapter: AIInterface) {
    this.modelAdapters.set(model, adapter);
  }
}