import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';
import { RedHoodProtocol } from './red-hood-protocol';

export interface TriggerConfig {
  apiKey: string;
  environment?: string;
}

export class TriggerClient extends EventEmitter {
  private apiKey: string;
  private protocol: RedHoodProtocol;

  constructor(config: TriggerConfig) {
    super();
    this.apiKey = config.apiKey;
    this.protocol = new RedHoodProtocol();
  }

  async executeJob(jobId: string, payload: any): Promise<any> {
    try {
      // Check Red Hood Protocol before execution
      const approval = await this.protocol.evaluateAction({
        jobId,
        payload,
        type: 'trigger-execution'
      });

      if (!approval.approved) {
        logger.warn(`Trigger.dev execution blocked by Red Hood Protocol: ${approval.reason}`);
        throw new Error(`Action blocked: ${approval.reason}`);
      }

      const response = await fetch('https://api.trigger.dev/api/v1/jobs/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          id: jobId,
          payload
        })
      });

      if (!response.ok) {
        throw new Error(`Trigger.dev job execution failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Trigger.dev execution error:', error);
      throw error;
    }
  }
}