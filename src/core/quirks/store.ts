import { Quirk } from './adapter';
import { ConvexClient } from '../../integrations/convex/client';
import { logger } from '../../utils/logger';

export class QuirkStore {
  constructor(private convex: ConvexClient) {}

  async saveQuirk(personaId: string, quirk: Quirk): Promise<void> {
    try {
      await this.convex.mutation('quirks/create', {
        personaId,
        quirk
      });
    } catch (error) {
      logger.error('Failed to save quirk:', error);
      throw error;
    }
  }

  async getQuirks(personaId: string): Promise<Quirk[]> {
    try {
      return await this.convex.query('quirks/list', { personaId });
    } catch (error) {
      logger.error('Failed to fetch quirks:', error);
      throw error;
    }
  }

  async updateQuirk(personaId: string, quirkId: string, updates: Partial<Quirk>): Promise<void> {
    try {
      await this.convex.mutation('quirks/update', {
        personaId,
        quirkId,
        updates
      });
    } catch (error) {
      logger.error('Failed to update quirk:', error);
      throw error;
    }
  }
}