import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '../utils/logger.js';
import cron from 'node-cron';

class BackupService {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }

  async backupData(data, type) {
    const date = new Date().toISOString();
    const key = `backups/${type}/${date}.json`;

    try {
      await this.s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_BACKUP_BUCKET,
        Key: key,
        Body: JSON.stringify(data),
        ContentType: 'application/json'
      }));
      logger.info(`Backup successful: ${key}`);
    } catch (error) {
      logger.error('Backup failed:', error);
      throw error;
    }
  }

  scheduleBackups() {
    // Daily backups at midnight
    cron.schedule('0 0 * * *', async () => {
      try {
        await this.backupSlackData();
        await this.backupNotionData();
        await this.backupTaskLogs();
      } catch (error) {
        logger.error('Scheduled backup failed:', error);
      }
    });
  }

  async backupSlackData() {
    // Implement Slack data backup
  }

  async backupNotionData() {
    // Implement Notion data backup
  }

  async backupTaskLogs() {
    // Implement task logs backup
  }
}

export const backupService = new BackupService();