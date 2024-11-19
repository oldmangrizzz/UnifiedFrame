import { CloudProvider } from '../../core/cloud-manager';
import { HfInference } from '@huggingface/inference';
import { logger } from '../../utils/logger';

export class HuggingFaceCloud implements CloudProvider {
  id = 'huggingface';
  name = 'Hugging Face Spaces';
  status: 'available' | 'unavailable' | 'limited' = 'available';
  resources = {
    cpu: 4,
    memory: 16,
    gpu: 1
  };
  costs = {
    cpuHour: 0.1,
    memoryHour: 0.05,
    gpuHour: 0.5
  };

  private client: HfInference;

  constructor(apiKey: string) {
    this.client = new HfInference(apiKey);
  }

  async checkAvailability(): Promise<void> {
    try {
      await this.client.ping();
      this.status = 'available';
    } catch (error) {
      logger.error('HuggingFace availability check failed:', error);
      this.status = 'unavailable';
    }
  }
}