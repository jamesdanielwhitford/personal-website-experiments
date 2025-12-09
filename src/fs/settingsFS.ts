// Settings file system service
// Handles API settings storage per app scope

import {
  getDirectoryHandle,
  getNestedDirectory,
  readJsonFile,
  writeJsonFile,
  deleteFile,
} from './fileSystem';

// Types
export type AppScope = 'beautifulmind' | 'games' | 'root';

export interface UserSettings {
  appScope: AppScope;
  apiKey: string;
  apiProvider: string;
  apiEndpoint?: string;
  createdAt: string;
  updatedAt: string;
}

// Get the sessions directory where settings are stored
async function getSessionsDirectory(): Promise<FileSystemDirectoryHandle | null> {
  const root = await getDirectoryHandle();
  if (!root) return null;
  return await getNestedDirectory(root, ['sessions']);
}

// Settings filename per app scope
function getSettingsFilename(appScope: AppScope): string {
  return `settings-${appScope}.json`;
}

export const settingsFS = {
  // Check if storage is connected
  async isConnected(): Promise<boolean> {
    const handle = await getDirectoryHandle();
    return handle !== null;
  },

  // Get settings for a specific app scope
  async getSettings(appScope: AppScope): Promise<UserSettings | null> {
    const sessionsDir = await getSessionsDirectory();
    if (!sessionsDir) return null;
    return await readJsonFile<UserSettings>(sessionsDir, getSettingsFilename(appScope));
  },

  // Save or update settings for an app scope
  async saveSettings(
    appScope: AppScope,
    apiKey: string,
    apiProvider: string,
    apiEndpoint?: string
  ): Promise<UserSettings> {
    const sessionsDir = await getSessionsDirectory();
    if (!sessionsDir) throw new Error('Storage not connected');

    const existing = await this.getSettings(appScope);
    const now = new Date().toISOString();

    const settings: UserSettings = {
      appScope,
      apiKey,
      apiProvider,
      apiEndpoint,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await writeJsonFile(sessionsDir, getSettingsFilename(appScope), settings);
    return settings;
  },

  // Delete settings for an app scope
  async deleteSettings(appScope: AppScope): Promise<boolean> {
    const sessionsDir = await getSessionsDirectory();
    if (!sessionsDir) return false;
    return await deleteFile(sessionsDir, getSettingsFilename(appScope));
  },

  // Check if API key exists for an app scope
  async hasApiKey(appScope: AppScope): Promise<boolean> {
    const settings = await this.getSettings(appScope);
    return !!settings?.apiKey;
  },

  // Get just the API key for an app scope
  async getApiKey(appScope: AppScope): Promise<string | null> {
    const settings = await this.getSettings(appScope);
    return settings?.apiKey || null;
  },
};
