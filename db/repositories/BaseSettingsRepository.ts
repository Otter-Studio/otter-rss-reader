/**
 * Settings 仓库实现
 */

import { ISettingsRepository } from '../abstractions';
import { ISettings } from '../models';

export class BaseSettingsRepository implements ISettingsRepository {
  constructor(private db: any) { }

  private ensureDb(): void {
    if (!this.db || !this.db.settings) {
      throw new Error('Database not initialized');
    }
  }

  async get(): Promise<ISettings | null> {
    try {
      this.ensureDb();

      // Settings 通常只有一条记录，使用默认 ID
      const settings = await this.db.settings.get('default-settings');
      return settings || null;
    } catch (error) {
      console.error('[BaseSettingsRepository] Failed to get settings:', error);
      throw error;
    }
  }

  async save(settings: ISettings): Promise<ISettings> {
    try {
      if (!this.db || !this.db.settings) {
        throw new Error('Database not initialized');
      }

      // 确保 ID 是 'default-settings'
      const settingsToSave = {
        ...settings,
        id: 'default-settings',
      };

      await this.db.settings.put(settingsToSave);
      return settingsToSave;
    } catch (error) {
      console.error('[BaseSettingsRepository] Failed to save settings:', error);
      throw error;
    }
  }

  async update(data: Partial<ISettings>): Promise<ISettings> {
    try {
      if (!this.db || !this.db.settings) {
        throw new Error('Database not initialized');
      }

      const existing = await this.get();
      if (!existing) {
        throw new Error('Settings not found');
      }

      const updated = {
        ...existing,
        ...data,
        id: 'default-settings', // 确保 ID 不变
      };

      await this.db.settings.put(updated);
      return updated;
    } catch (error) {
      console.error('[BaseSettingsRepository] Failed to update settings:', error);
      throw error;
    }
  }

  async reset(): Promise<ISettings> {
    try {
      if (!this.db || !this.db.settings) {
        throw new Error('Database not initialized');
      }

      // 删除现有设置
      await this.db.settings.delete('default-settings');

      // 返回默认设置
      const defaultSettings: ISettings = {
        id: 'default-settings',
        baseUrl: '',
        username: '',
        password: '',
        theme: 'system' as any,
        refreshInterval: 30,
        articlesPerPage: 20,
        language: 'en',
        autoMarkAsRead: false,
        autoMarkAsReadDelay: 5000,
        notificationsEnabled: true,
        soundNotificationEnabled: true,
        vibrationEnabled: true,
        offlineModeEnabled: true,
        cacheItemLimit: 1000,
        compressionEnabled: true,
        readingModeEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.db.settings.put(defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('[BaseSettingsRepository] Failed to reset settings:', error);
      throw error;
    }
  }

  async exists(): Promise<boolean> {
    try {
      if (!this.db || !this.db.settings) {
        return false;
      }

      const settings = await this.db.settings.get('default-settings');
      return !!settings;
    } catch (error) {
      console.error('[BaseSettingsRepository] Failed to check if settings exist:', error);
      return false;
    }
  }
}
