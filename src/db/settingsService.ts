import { db } from './database';
import type { UserSettings } from './database';

type AppScope = 'beautifulmind' | 'games' | 'root';

/**
 * Settings Service
 * Manages API keys and settings stored locally in IndexedDB
 * Each app scope has its own settings (one settings record per app)
 */
export const settingsService = {
  /**
   * Get settings for a specific app scope
   */
  async getSettings(appScope: AppScope): Promise<UserSettings | undefined> {
    return await db.settings.where('appScope').equals(appScope).first();
  },

  /**
   * Save or update settings for an app scope
   * Only one settings record per app scope
   */
  async saveSettings(
    appScope: AppScope,
    apiKey: string,
    apiProvider: string,
    apiEndpoint?: string
  ): Promise<number> {
    const existing = await db.settings.where('appScope').equals(appScope).first();

    if (existing) {
      // Update existing settings
      await db.settings.update(existing.id!, {
        apiKey,
        apiProvider,
        apiEndpoint,
        updatedAt: new Date(),
      });
      return existing.id!;
    } else {
      // Create new settings
      return await db.settings.add({
        appScope,
        apiKey,
        apiProvider,
        apiEndpoint,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  },

  /**
   * Delete settings for an app scope
   */
  async deleteSettings(appScope: AppScope): Promise<void> {
    const existing = await db.settings.where('appScope').equals(appScope).first();
    if (existing && existing.id) {
      await db.settings.delete(existing.id);
    }
  },

  /**
   * Check if API key exists for an app scope
   */
  async hasApiKey(appScope: AppScope): Promise<boolean> {
    const settings = await db.settings.where('appScope').equals(appScope).first();
    return !!settings?.apiKey;
  },

  /**
   * Get just the API key for an app scope (convenience method)
   */
  async getApiKey(appScope: AppScope): Promise<string | null> {
    const settings = await db.settings.where('appScope').equals(appScope).first();
    return settings?.apiKey || null;
  },
};
