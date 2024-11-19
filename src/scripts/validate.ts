import { AgentManager } from '../core/agent-manager';
import { CloudManager } from '../core/cloud-manager';
import { IdentityManager } from '../core/identity/manager';
import { QuirksAdapter } from '../core/quirks/adapter';
import { WorkflowManager } from '../core/workflow/manager';
import { FeedbackLoop } from '../services/feedback-loop';
import { logger } from '../utils/logger';

async function validateFramework() {
  logger.info('Starting framework validation...');

  // Initialize core components
  const agentManager = new AgentManager();
  const cloudManager = new CloudManager();
  const quirksAdapter = new QuirksAdapter();
  const identityManager = new IdentityManager(quirksAdapter);
  const workflowManager = new WorkflowManager(
    { baseUrl: process.env.N8N_URL!, apiKey: process.env.N8N_API_KEY! },
    { apiKey: process.env.TRIGGER_API_KEY! }
  );
  const feedbackLoop = new FeedbackLoop();

  try {
    // Validate identity management
    logger.info('Validating identity management...');
    const redHood = await identityManager.loadIdentity('red-hood');
    const nightwing = await identityManager.loadIdentity('nightwing');
    logger.info('Identity management: ✓');

    // Validate cloud infrastructure
    logger.info('Validating cloud infrastructure...');
    const provider = await cloudManager.selectOptimalProvider({
      minCpu: 4,
      minMemory: 16,
      minGpu: 1
    });
    logger.info(`Selected cloud provider: ${provider.name}`);
    logger.info('Cloud infrastructure: ✓');

    // Validate workflow systems
    logger.info('Validating workflow systems...');
    await workflowManager.executeWorkflow({
      type: 'n8n',
      workflowId: 'test-workflow',
      payload: { test: true }
    });
    logger.info('Workflow systems: ✓');

    // Validate feedback loop
    logger.info('Validating feedback loop...');
    const evaluation = await feedbackLoop.evaluateResponse({
      content: 'Test response',
      metadata: { id: 'test-1' },
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
    });
    logger.info('Feedback loop: ✓');

    logger.info('Framework validation completed successfully');
    return true;
  } catch (error) {
    logger.error('Framework validation failed:', error);
    return false;
  }
}

validateFramework().then(success => {
  process.exit(success ? 0 : 1);
});