import { Client } from '@notionhq/client';
import { WebhookClient } from 'webhook-discord';
import { logger } from '../../utils/logger.js';

class NotionSync {
  constructor() {
    this.notion = new Client({ auth: process.env.NOTION_API_KEY });
    this.discord = new WebhookClient(process.env.DISCORD_WEBHOOK_URL);
  }

  async syncPage(pageId) {
    try {
      const page = await this.notion.pages.retrieve({ page_id: pageId });
      const blocks = await this.notion.blocks.children.list({ block_id: pageId });
      
      // Sync to other platforms
      await this.syncToSlack(page, blocks);
      await this.notifyDiscord(page);
      
      logger.info(`Synced Notion page: ${pageId}`);
    } catch (error) {
      logger.error('Notion sync failed:', error);
      throw error;
    }
  }

  async syncToSlack(page, blocks) {
    // Implement Slack sync
  }

  async notifyDiscord(page) {
    await this.discord.send(`Page updated: ${page.properties.title.title[0].text.content}`);
  }
}

export const notionSync = new NotionSync();