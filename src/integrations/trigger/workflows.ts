import { TriggerClient } from '../../core/workflow/trigger-client';
import { logger } from '../../utils/logger';

export interface TriggerJobDefinition {
  id: string;
  name: string;
  description: string;
  schedule?: string;
  event?: {
    source: string;
    type: string;
  };
  actions: {
    type: string;
    parameters: Record<string, any>;
  }[];
}

export class TriggerWorkflowManager {
  constructor(private client: TriggerClient) {}

  async deployJob(definition: TriggerJobDefinition): Promise<void> {
    try {
      await this.client.executeJob('job-deployment', {
        action: 'deploy',
        definition
      });
      
      logger.info(`Deployed Trigger.dev job: ${definition.name}`);
    } catch (error) {
      logger.error('Trigger.dev job deployment failed:', error);
      throw error;
    }
  }

  async executeJob(jobId: string, payload: any): Promise<any> {
    return await this.client.executeJob(jobId, payload);
  }
}