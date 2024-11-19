import { EventEmitter } from 'events';
import { QuirksAdapter, Quirk } from './adapter';
import { QuirkStore } from './store';
import { logger } from '../../utils/logger';

export interface PersonaConfig {
  id: string;
  name: string;
  basePersonality: {
    tone: string;
    style: string;
    traits: string[];
  };
  contextRules: {
    formal: boolean;
    casual: boolean;
    technical: boolean;
  };
}

export class PersonaManager extends EventEmitter {
  private personas: Map<string, PersonaConfig> = new Map();
  
  constructor(
    private quirksAdapter: QuirksAdapter,
    private quirkStore: QuirkStore
  ) {
    super();
  }

  async createPersona(config: PersonaConfig): Promise<void> {
    this.personas.set(config.id, config);
    
    // Generate initial quirks based on personality
    const quirks = await this.generateInitialQuirks(config);
    
    // Register quirks with adapter and store
    for (const quirk of quirks) {
      this.quirksAdapter.registerQuirk(config.id, quirk);
      await this.quirkStore.saveQuirk(config.id, quirk);
    }
    
    logger.info(`Created persona: ${config.name} (${config.id})`);
  }

  private async generateInitialQuirks(config: PersonaConfig): Promise<Quirk[]> {
    const quirks: Quirk[] = [];
    
    // Generate tone quirk
    quirks.push({
      id: `${config.id}-tone`,
      type: 'tone',
      value: config.basePersonality.tone,
      context: ['all'],
      weight: 1.0
    });
    
    // Generate mannerism quirks from traits
    config.basePersonality.traits.forEach((trait, index) => {
      quirks.push({
        id: `${config.id}-mannerism-${index}`,
        type: 'mannerism',
        value: trait,
        context: ['all'],
        weight: 0.8
      });
    });
    
    return quirks;
  }

  async updatePersona(id: string, updates: Partial<PersonaConfig>): Promise<void> {
    const existing = this.personas.get(id);
    if (!existing) throw new Error(`Persona ${id} not found`);
    
    const updated = { ...existing, ...updates };
    this.personas.set(id, updated);
    
    // Update quirks if personality changes
    if (updates.basePersonality) {
      const newQuirks = await this.generateInitialQuirks(updated);
      for (const quirk of newQuirks) {
        await this.quirkStore.updateQuirk(id, quirk.id, quirk);
      }
    }
  }
}