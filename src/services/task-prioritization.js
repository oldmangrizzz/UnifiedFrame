import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

class TaskPrioritizer extends EventEmitter {
  constructor() {
    super();
    this.tasks = new Map();
    this.providers = new Map();
  }

  addProvider(name, capabilities) {
    this.providers.set(name, {
      capabilities,
      load: 0
    });
  }

  async prioritizeTask(task) {
    const { type, urgency = 'normal' } = task;
    
    const priority = this.calculatePriority(urgency);
    const bestProvider = this.selectProvider(type);
    
    return {
      ...task,
      priority,
      provider: bestProvider
    };
  }

  calculatePriority(urgency) {
    const priorities = {
      low: 1,
      normal: 2,
      high: 3,
      critical: 4
    };
    return priorities[urgency] || 2;
  }

  selectProvider(taskType) {
    let bestProvider = null;
    let lowestLoad = Infinity;

    for (const [name, info] of this.providers) {
      if (info.capabilities.includes(taskType) && info.load < lowestLoad) {
        bestProvider = name;
        lowestLoad = info.load;
      }
    }

    return bestProvider;
  }
}

export const taskPrioritizer = new TaskPrioritizer();