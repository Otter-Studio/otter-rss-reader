import { getRealm } from '../initialize';
import { UserSettings } from '../models';

/**
 * UserSettings 操作
 */
export const SettingsOperations = {
  /**
   * 初始化用户设置
   */
  initializeSettings(): UserSettings {
    const realm = getRealm();
    const existing = realm.objects<UserSettings>('UserSettings').length;

    if (existing > 0) {
      return realm.objects<UserSettings>('UserSettings')[0]!;
    }

    let settings: UserSettings;

    realm.write(() => {
      settings = realm.create<UserSettings>('UserSettings', {
        id: 'default-settings',
        theme: 'light',
        refreshInterval: 3600,
        articlesPerPage: 20,
        language: 'en',
        autoMarkAsRead: false,
        notificationsEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return settings!;
  },

  /**
   * 获取用户设置
   */
  getSettings(): UserSettings {
    const realm = getRealm();
    let settings = realm.objects<UserSettings>('UserSettings')[0];

    if (!settings) {
      settings = SettingsOperations.initializeSettings();
    }

    return settings;
  },

  /**
   * 更新用户设置
   */
  updateSettings(updates: Partial<Omit<UserSettings, 'id' | 'createdAt'>>): UserSettings {
    const realm = getRealm();
    const settings = SettingsOperations.getSettings();

    realm.write(() => {
      Object.assign(settings, {
        ...updates,
        updatedAt: new Date(),
      });
    });

    return settings;
  },

  /**
   * 重置为默认设置
   */
  resetToDefaults(): UserSettings {
    const realm = getRealm();
    const settings = SettingsOperations.getSettings();

    realm.write(() => {
      settings.theme = 'light';
      settings.refreshInterval = 3600;
      settings.articlesPerPage = 20;
      settings.language = 'en';
      settings.autoMarkAsRead = false;
      settings.notificationsEnabled = true;
      settings.updatedAt = new Date();
    });

    return settings;
  },
};
