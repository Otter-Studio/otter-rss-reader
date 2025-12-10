import { dbManager } from './database';

/**
 * 用户设置数据模型
 */
export interface UserSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  refresh_interval: number;
  articles_per_page: number;
  language: string;
  auto_mark_as_read: boolean;
  notifications_enabled: boolean;
  last_sync_time?: string;
  base_url?: string;
  username?: string;
  password?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 用户设置操作类
 */
export class SettingsOperations {
  private static DEFAULT_SETTINGS_ID = 'default-settings';

  /**
   * 初始化用户设置
   */
  static async initializeSettings(): Promise<UserSettings> {
    const existing = await this.getSettings();

    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    await dbManager.execute(
      `INSERT INTO user_settings (id, theme, refresh_interval, articles_per_page, language, auto_mark_as_read, notifications_enabled, base_url, username, password, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        this.DEFAULT_SETTINGS_ID,
        'light',
        3600,
        20,
        'en',
        0,
        1,
        null,
        null,
        null,
        now,
        now,
      ]
    );

    return await this.getSettings() as UserSettings;
  }

  /**
   * 获取用户设置
   */
  static async getSettings(): Promise<UserSettings | null> {
    const settings = await dbManager.queryOne<any>(
      `SELECT * FROM user_settings WHERE id = ?`,
      [this.DEFAULT_SETTINGS_ID]
    );

    if (!settings) {
      return null;
    }

    return {
      ...settings,
      theme: settings.theme as 'light' | 'dark' | 'system',
      auto_mark_as_read: Boolean(settings.auto_mark_as_read),
      notifications_enabled: Boolean(settings.notifications_enabled),
    };
  }

  /**
   * 更新用户设置
   */
  static async updateSettings(updates: Partial<Omit<UserSettings, 'id' | 'created_at'>>): Promise<UserSettings> {
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        updateFields.push(`${key} = ?`);
        if (typeof value === 'boolean') {
          updateValues.push(value ? 1 : 0);
        } else if (value === null) {
          updateValues.push(null);
        } else {
          updateValues.push(value);
        }
      }
    });

    if (updateFields.length > 0) {
      updateFields.push(`updated_at = ?`);
      updateValues.push(new Date().toISOString());
      updateValues.push(this.DEFAULT_SETTINGS_ID);

      await dbManager.execute(
        `UPDATE user_settings SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    return await this.getSettings() as UserSettings;
  }

  /**
   * 更新主题
   */
  static async setTheme(theme: 'light' | 'dark' | 'system'): Promise<UserSettings> {
    return await this.updateSettings({ theme });
  }

  /**
   * 更新刷新间隔（秒）
   */
  static async setRefreshInterval(seconds: number): Promise<UserSettings> {
    return await this.updateSettings({ refresh_interval: seconds });
  }

  /**
   * 更新每页文章数
   */
  static async setArticlesPerPage(count: number): Promise<UserSettings> {
    return await this.updateSettings({ articles_per_page: count });
  }

  /**
   * 更新语言
   */
  static async setLanguage(language: string): Promise<UserSettings> {
    return await this.updateSettings({ language });
  }

  /**
   * 更新自动标记已读设置
   */
  static async setAutoMarkAsRead(enabled: boolean): Promise<UserSettings> {
    return await this.updateSettings({ auto_mark_as_read: enabled });
  }

  /**
   * 更新通知设置
   */
  static async setNotificationsEnabled(enabled: boolean): Promise<UserSettings> {
    return await this.updateSettings({ notifications_enabled: enabled });
  }

  /**
   * 更新最后同步时间
   */
  static async updateLastSyncTime(): Promise<UserSettings> {
    return await this.updateSettings({ last_sync_time: new Date().toISOString() });
  }

  /**
   * 设置用户信息（baseUrl, username, password）
   */
  static async setUserInfo(baseUrl: string, username: string, password: string): Promise<UserSettings> {
    return await this.updateSettings({
      base_url: baseUrl,
      username,
      password,
    });
  }

  /**
   * 获取用户信息
   */
  static async getUserInfo(): Promise<{
    baseUrl?: string;
    username?: string;
    password?: string;
  } | null> {
    const settings = await this.getSettings();
    if (!settings) {
      return null;
    }

    return {
      baseUrl: settings.base_url,
      username: settings.username,
      password: settings.password,
    };
  }

  /**
   * 更新 Base URL
   */
  static async setBaseUrl(baseUrl: string): Promise<UserSettings> {
    return await this.updateSettings({ base_url: baseUrl });
  }

  /**
   * 更新用户名
   */
  static async setUsername(username: string): Promise<UserSettings> {
    return await this.updateSettings({ username });
  }

  /**
   * 更新密码
   */
  static async setPassword(password: string): Promise<UserSettings> {
    return await this.updateSettings({ password });
  }

  /**
   * 清除用户信息
   */
  static async clearUserInfo(): Promise<UserSettings> {
    return await this.updateSettings({
      base_url: null as any,
      username: null as any,
      password: null as any,
    });
  }

  /**
   * 重置为默认设置
   */
  static async resetToDefaults(): Promise<UserSettings> {
    const now = new Date().toISOString();
    await dbManager.execute(
      `UPDATE user_settings SET theme = ?, refresh_interval = ?, articles_per_page = ?, language = ?, auto_mark_as_read = ?, notifications_enabled = ?, base_url = ?, username = ?, password = ?, updated_at = ? WHERE id = ?`,
      ['light', 3600, 20, 'en', 0, 1, null, null, null, now, this.DEFAULT_SETTINGS_ID]
    );

    return await this.getSettings() as UserSettings;
  }
}
