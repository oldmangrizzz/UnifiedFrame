import express from 'express';
import dotenv from 'dotenv';
import { setupSlackEvents } from './integrations/slack/events.js';
import { setupAIRoutes } from './routes/ai.js';
import { setupDatabaseConnection } from './database/index.js';
import { pluginManager } from './core/plugin-manager.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize core systems
await setupDatabaseConnection();

// Initialize integrations
setupSlackEvents(app);
setupAIRoutes(app);

// Example plugin registration
pluginManager.registerHook('pre-generate', async (request) => {
  // Add metadata or modify request
  return {
    ...request,
    context: { ...request.context, timestamp: new Date().toISOString() }
  };
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});