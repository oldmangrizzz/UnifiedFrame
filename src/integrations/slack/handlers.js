import { WebClient } from '@slack/web-api';
import { taskQueue } from '../../services/task-queue.js';
import { logger } from '../../utils/logger.js';

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function handleDirectMessage(event) {
  try {
    const { text, user, channel } = event;
    
    // Process the message through AI
    const response = await taskQueue.addTask({
      provider: 'openai',
      request: {
        prompt: text,
        context: { user, channel }
      }
    });

    // Send response back to Slack
    await slackClient.chat.postMessage({
      channel,
      text: response.content,
      thread_ts: event.thread_ts
    });
  } catch (error) {
    logger.error('Error handling direct message:', error);
  }
}

export async function handleChannelMessage(event) {
  try {
    const { text, channel, thread_ts } = event;
    
    if (text.includes('@ai')) {
      const response = await taskQueue.addTask({
        provider: 'anthropic',
        request: {
          prompt: text.replace('@ai', '').trim(),
          context: { channel, thread_ts }
        }
      });

      await slackClient.chat.postMessage({
        channel,
        text: response.content,
        thread_ts: thread_ts || event.ts
      });
    }
  } catch (error) {
    logger.error('Error handling channel message:', error);
  }
}