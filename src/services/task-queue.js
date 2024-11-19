import fastq from 'fastq';
import { logger } from '../utils/logger.js';

class TaskQueue {
  constructor(concurrency = 5) {
    this.queue = fastq(this.worker.bind(this), concurrency);
  }

  async worker(task) {
    try {
      const { provider, request } = task;
      return await provider.generate(request);
    } catch (error) {
      logger.error('Task execution error:', error);
      throw error;
    }
  }

  async addTask(provider, request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ provider, request }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

export const taskQueue = new TaskQueue();