import express from 'express';
import { OpenAIProvider } from '../integrations/ai/openai.js';
import { AnthropicProvider } from '../integrations/ai/anthropic.js';
import { taskQueue } from '../services/task-queue.js';
import { pluginManager } from '../core/plugin-manager.js';
import { logger } from '../utils/logger.js';

const openAI = new OpenAIProvider();
const anthropic = new AnthropicProvider();

export function setupAIRoutes(app) {
  const router = express.Router();

  router.post('/generate', async (req, res) => {
    try {
      const { provider = 'openai', ...request } = req.body;
      
      // Pre-processing hook
      const processedRequest = await pluginManager.executeHook('pre-generate', request);
      
      const aiProvider = provider === 'anthropic' ? anthropic : openAI;
      const response = await taskQueue.addTask(aiProvider, processedRequest);
      
      // Post-processing hook
      const processedResponse = await pluginManager.executeHook('post-generate', response);
      
      res.json(processedResponse);
    } catch (error) {
      logger.error('Error generating AI response:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/stream', async (req, res) => {
    try {
      const stream = await openAI.stream(req.body);
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      
      res.end();
    } catch (error) {
      logger.error('Error streaming AI response:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.use('/ai', router);
}