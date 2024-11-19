import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger.js';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: msg => logger.debug(msg)
});

export async function setupDatabaseConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    process.exit(1);
  }
}

export { sequelize };