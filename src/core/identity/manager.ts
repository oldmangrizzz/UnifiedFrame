import { readFile } from 'fs/promises';
import { join } from 'path';
import { EventEmitter } from 'events';
import { QuirksAdapter } from '../quirks/adapter';
import { logger } from '../../utils/logger';

export interface Identity {
  id: string;
  name: string;
  systemPrompt: string;
  metadata: {
    version: string;
    lastUpdated: string;
    author?: string;
    tags?: string[];
    model?: string;
    trainingStatus?: 'pending' | 'in-progress' | 'complete';
  };
}

export class IdentityManager extends EventEmitter {
  private identities: Map<string, Identity> = new Map();
  private readonly identityPath: string;

  constructor(
    private quirksAdapter: QuirksAdapter,
    basePath: string = 'identities'
  ) {
    super();
    this.identityPath = join(process.cwd(), basePath);
  }

  async loadIdentity(id: string): Promise<Identity> {
    try {
      const filePath = join(this.identityPath, `${id}.md`);
      const content = await readFile(filePath, 'utf-8');
      
      const { metadata, systemPrompt } = this.parseIdentityFile(content);
      
      const identity: Identity = {
        id,
        name: metadata.name || id,
        systemPrompt,
        metadata: {
          version: metadata.version || '1.0.0',
          lastUpdated: metadata.lastUpdated || new Date().toISOString(),
          ...metadata
        }
      };

      this.identities.set(id, identity);
      this.emit('identity:loaded', id);
      
      return identity;
    } catch (error) {
      logger.error(`Failed to load identity ${id}:`, error);
      throw error;
    }
  }

  private parseIdentityFile(content: string): {
    metadata: Record<string, any>;
    systemPrompt: string;
  } {
    // Split frontmatter and content
    const matches = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!matches) {
      throw new Error('Invalid identity file format. Must include YAML frontmatter.');
    }

    const [_, frontmatter, systemPrompt] = matches;
    
    // Parse YAML frontmatter
    const metadata = this.parseYAML(frontmatter);
    
    return {
      metadata,
      systemPrompt: systemPrompt.trim()
    };
  }

  private parseYAML(yaml: string): Record<string, any> {
    // Simple YAML parser for frontmatter
    const result: Record<string, any> = {};
    const lines = yaml.split('\n');
    
    for (const line of lines) {
      const [key, ...values] = line.split(':');
      if (key && values.length) {
        result[key.trim()] = values.join(':').trim();
      }
    }
    
    return result;
  }

  async getSystemPrompt(id: string): Promise<string> {
    const identity = this.identities.get(id) || await this.loadIdentity(id);
    return identity.systemPrompt;
  }

  async getIdentityMetadata(id: string): Promise<Record<string, any>> {
    const identity = this.identities.get(id) || await this.loadIdentity(id);
    return identity.metadata;
  }
}