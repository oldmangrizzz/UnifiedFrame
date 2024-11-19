import { EventEmitter } from 'events';
import { N8NClient, N8NConfig } from './n8n-client';
import { TriggerClient, TriggerConfig } from './trigger-client';
import { logger } from '../../utils/logger';

export class WorkflowManager extends EventEmitter {
  private n8nClient: N8NClient;
  private triggerClient: TriggerClient;

  constructor(n8nConfig: N8NConfig, triggerConfig: TriggerConfig) {
    super();
    this.n8nClient = new N8NClient(n8nConfig);
    this.triggerClient = new TriggerClient(triggerConfig);
  }

  async executeWorkflow(params: {
    type: 'n8n' | 'trigger';
    workflowId: string;
    payload: any;
  }): Promise<any> {
    try {
      if (params.type === 'n8n') {
        return await this.n8nClient.executeWorkflow(params.workflowId, params.payload);
      } else {
        return await this.triggerClient.executeJob(params.workflowId, params.payload);
      }
    } catch (error) {
      logger.error('Workflow execution error:', error);
      throw error;
    }
  }
}