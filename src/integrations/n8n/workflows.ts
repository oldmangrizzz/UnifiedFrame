import { N8NClient } from '../../core/workflow/n8n-client';
import { logger } from '../../utils/logger';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  triggers: {
    type: string;
    config: Record<string, any>;
  }[];
  nodes: {
    type: string;
    parameters: Record<string, any>;
  }[];
}

export class N8NWorkflowManager {
  constructor(private client: N8NClient) {}

  async deployWorkflow(definition: WorkflowDefinition): Promise<void> {
    try {
      await this.client.executeWorkflow('workflow-deployment', {
        action: 'deploy',
        definition
      });
      
      logger.info(`Deployed N8N workflow: ${definition.name}`);
    } catch (error) {
      logger.error('N8N workflow deployment failed:', error);
      throw error;
    }
  }

  async executeWorkflow(workflowId: string, data: any): Promise<any> {
    return await this.client.executeWorkflow(workflowId, data);
  }
}