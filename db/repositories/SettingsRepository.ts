import type { ISettingsRepository } from '@/db/abstractions/ISettingsRepository';
import type { ISettings } from '@/db/models';
import BaseRepository from '@/db/abstractions/BaseRepository';
import type { IDbAdapter } from '@/db/abstractions/IDbAdapter';

export class SettingsRepository implements ISettingsRepository {
  private base: BaseRepository<ISettings>;

  constructor(adapter: IDbAdapter<ISettings>) {
    this.base = new BaseRepository<ISettings>(adapter);
  }

  async get(): Promise<ISettings | null> {
    return this.base.getById('default-settings');
  }

  async save(settings: ISettings): Promise<ISettings> {
    const id = settings.id ?? 'default-settings';
    const existing = await this.get();
    if (existing) return this.base.update(id, settings);
    return this.base.create({ ...settings, id });
  }

  async update(data: Partial<ISettings>): Promise<ISettings> {
    const existing = await this.get();
    if (!existing) throw new Error('Settings not found');
    return this.base.update('default-settings', { ...existing, ...data, id: 'default-settings' });
  }

  async reset(): Promise<ISettings> {
    await this.base.delete('default-settings');
    const now = new Date();
    const defaults: ISettings = {
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
      lastSyncTime: 0,
      offlineModeEnabled: true,
      cacheItemLimit: 1000,
      compressionEnabled: true,
      fontSizeMultiplier: 1,
      lineHeightMultiplier: 1.4,
      readingModeEnabled: true,
      feedsGroupedViewEnabled: true,
      backgroundColor: '',
      textColor: '',
      createdAt: now,
      updatedAt: now,
    };
    return this.save(defaults);
  }

  async exists(): Promise<boolean> {
    const s = await this.get();
    return !!s;
  }
}

export default SettingsRepository;