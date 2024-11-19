import { Queue, Worker } from 'bullmq';
import { Agent } from '../core/agent-manager';
import { AIRequest, AIResponse } from '../core/ai-interface';
import { logger } from '../utils/logger';

export class TaskQueue {
  private queue: Queue;
  private worker: Worker;

  constructor() {
    this.queue = new Queue('ai-tasks', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });

    this.worker = new Worker('ai-tasks', 
      async job => {
        const { agent, request } = job.data;
        return await this.processTask(agent, request);
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379')
        },
        concurrency: 5
      }
    );

    this.worker.on('completed', job => {
      logger.info(`Task ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      logger.error(`Task ${job?.id} failed:`, err);
    });
  }

  async addTask(agent: Agent, request: AIRequest): Promise<AIResponse> {
    const job = await this.queue.add('execute', { agent, request });
    return await job.waitUntilFinished();
  }

  private async processTask(agent: Agent, request: AIRequest): Promise<AIResponse> {
    try {
      return await agent.execute(request);
    } catch (error) {
      logger.error(`Error processing task for agent ${agent.id}:`, error);
      throw error;
    }
  }
}