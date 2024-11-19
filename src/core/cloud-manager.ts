import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

export interface CloudProvider {
  id: string;
  name: string;
  status: 'available' | 'unavailable' | 'limited';
  resources: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  costs: {
    cpuHour: number;
    memoryHour: number;
    gpuHour?: number;
  };
}

export class CloudManager extends EventEmitter {
  private providers: Map<string, CloudProvider> = new Map();
  private activeProvider: string | null = null;

  registerProvider(provider: CloudProvider) {
    this.providers.set(provider.id, provider);
    logger.info(`Cloud provider ${provider.name} registered`);
  }

  async selectOptimalProvider(requirements: {
    minCpu: number;
    minMemory: number;
    minGpu?: number;
    maxCost?: number;
  }): Promise<CloudProvider> {
    const availableProviders = Array.from(this.providers.values())
      .filter(p => p.status === 'available')
      .filter(p => {
        return p.resources.cpu >= requirements.minCpu &&
               p.resources.memory >= requirements.minMemory &&
               (!requirements.minGpu || (p.resources.gpu || 0) >= requirements.minGpu);
      });

    if (availableProviders.length === 0) {
      throw new Error('No suitable cloud provider available');
    }

    // Sort by cost if maxCost is specified
    if (requirements.maxCost) {
      availableProviders.sort((a, b) => 
        (a.costs.cpuHour + a.costs.memoryHour) - 
        (b.costs.cpuHour + b.costs.memoryHour)
      );
    }

    const selected = availableProviders[0];
    this.activeProvider = selected.id;
    this.emit('provider-changed', selected);
    
    return selected;
  }

  async migrateWorkload(fromProvider: string, toProvider: string): Promise<void> {
    // Implementation for workload migration
    logger.info(`Migrating workload from ${fromProvider} to ${toProvider}`);
  }
}