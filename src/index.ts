import { CloudOrchestrator } from './services/orchestrator';
import { logger } from './utils/logger';

// ... (previous index.ts code) ...

async function bootstrap() {
  // Initialize cloud orchestration
  const cloudOrchestrator = new CloudOrchestrator();

  // Get optimal provider for initial deployment
  const provider = await cloudOrchestrator.getOptimalProvider({
    minCpu: 4,
    minMemory: 16,
    minGpu: 1,
    maxCost: 1.0
  });

  logger.info(`Selected cloud provider: ${provider.name}`);

  // ... (rest of the bootstrap code) ...
}

bootstrap().catch(error => {
  logger.error('Server initialization failed:', error);
  process.exit(1);
});