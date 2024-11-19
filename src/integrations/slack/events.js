import { createEventAdapter } from '@slack/events-api';
import { WebClient } from '@slack/web-api';
import { logger } from '../../utils/logger.js';

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

export function setupSlackEvents(app) {
  app.use('/slack/events', slackEvents.requestListener());

  slackEvents.on('message', async (event) => {
    try {
      if (event.subtype === undefined && !event.bot_id) {
        await handleMessage(event);
      }
    } catch (error) {
      logger.error('Error handling Slack message:', error);
    }
  });
}

async function handleMessage(event) {
  // Process incoming messages and route to appropriate AI service
  logger.info(`Received message: ${event.text}`);
}