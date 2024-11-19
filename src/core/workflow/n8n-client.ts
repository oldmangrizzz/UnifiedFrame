import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';

export interface N8NConfig {
  baseUrl: string;
  apiKey: string;
  workflowId?: string;
}

export class N8NClient extends EventEmitter {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: N8NConfig) {
    super();
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  async executeWorkflow(workflowId: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/${workflowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': this.apiKey
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`N8N workflow execution failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('N8N workflow execution error:', error);
      throw error;
    }
  }

  async getWorkflowStatus(executionId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/executions/${executionId}`, {
        headers: {
          'X-N8N-API-KEY': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get workflow status: ${response.statusText}`);
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      logger.error('N8N status check error:', error);
      throw error;
    }
  }
}