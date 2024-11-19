import { Client } from '@relay/client';
import { logger } from '../../utils/logger';

export class RelayIntegration {
  private client: Client;

  constructor(apiKey: string) {
    this.client = new Client({
      apiKey,
      environment: process.env.NODE_ENV
    });
  }

  async createWorkflow(config: {
    trigger: string;
    actions: Array<{
      type: string;
      params: Record<string, any>;
    }>;
  }) {
    try {
      return await this.client.workflows.create({
        ...config,
        metadata: {
          source: 'unified-ai-framework'
        }
      });
    } catch (error) {
      logger.error('Relay workflow creation failed:', error);
      throw error;
    }
  }

  async triggerWorkflow(workflowId: string, payload: any) {
    try {
      return await this.client.workflows.trigger(workflowId, payload);
    } catch (error) {
      logger.error('Relay workflow trigger failed:', error);
      throw error;
    }
  }
}