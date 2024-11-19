import { CloudManager } from '../core/cloud-manager';
import { HuggingFaceCloud } from '../integrations/cloud/huggingface';
import { IBMCloud } from '../integrations/cloud/ibm';
import { logger } from '../utils/logger';

export class CloudOrchestrator {
  private cloudManager: CloudManager;
  private healthCheckInterval: NodeJS.Timeout;

  constructor() {
    this.cloudManager = new CloudManager();
    
    // Register cloud providers
    this.cloudManager.registerProvider(
      new HuggingFaceCloud(process.env.HUGGINGFACE_API_KEY!)
    );
    
    this.cloudManager.registerProvider(
      new IBMCloud({
        apiKey: process.env.IBM_CLOUD_API_KEY,
        region: process.env.IBM_CLOUD_REGION
      })
    );

    // Start health checks
    this.healthCheckInterval = setInterval(
      () => this.checkProvidersHealth(),
      5 * 60 * 1000 // Every 5 minutes
    );

    this.cloudManager.on('provider-changed', provider => {
      logger.info(`Switched to cloud provider: ${provider.name}`);
    });
  }

  private async checkProvidersHealth(): Promise<void> {
    for (const provider of this.cloudManager.providers.values()) {
      await provider.checkAvailability();
    }
  }

  async getOptimalProvider(requirements: {
    minCpu: number;
    minMemory: number;
    minGpu?: number;
    maxCost?: number;
  }) {
    return await this.cloudManager.selectOptimalProvider(requirements);
  }

  async handleFailover(currentProvider: string): Promise<void> {
    try {
      const newProvider = await this.cloudManager.selectOptimalProvider({
        minCpu: 4,
        minMemory: 16
      });

      await this.cloudManager.migrateWorkload(currentProvider, newProvider.id);
    } catch (error) {
      logger.error('Failover failed:', error);
      throw error;
    }
  }
}