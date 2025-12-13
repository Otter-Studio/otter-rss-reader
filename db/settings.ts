/**
 * Settings Operations - 便利层
 * 
 * 提供一个简化的 API 来访问设置相关的数据库操作
 */

import { getDatabase } from './container';
import { ISettings } from './models';
import { ThemeType } from './models/types';

/**
 * 默认设置
 */
const DEFAULT_SETTINGS: ISettings = {
  id: 'default-settings',
  baseUrl: '',
  username: '',
  password: '',
  theme: ThemeType.SYSTEM,
  refreshInterval: 30, // 秒
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

/**
 * 重试工具函数 - 处理数据库锁定等临时性错误
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const errorMessage = (error as any).message || String(error);

      // 检查是否是可重试的错误（数据库锁定）
      if (!errorMessage.includes('database is locked')) {
        throw error; // 不可重试的错误，立即抛出
      }

      if (attempt < maxRetries - 1) {
        // 使用指数退避延迟
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(
          `[SettingsOperations] ${operationName} failed with database lock (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Settings 操作对象
 * 
 * 提供访问设置数据的便利方法
 */
export const SettingsOperations = {
  /**
   * 获取当前设置
   */
  async getSettings(): Promise<Partial<ISettings>> {
    // 内存缓存与并发保护：避免重复获取设置
    if (settingsCache) {
      return settingsCache;
    }
    if (settingsInFlight) {
      return settingsInFlight;
    }

    settingsInFlight = (async () => {
      try {
        const result = await retryOperation(async () => {
          const database = await getDatabase();
          const settings = await database.settings.get();
          // 若读取到空/无效设置，返回空对象以便上层自行处理
          return settings ?? {};
        }, 'getSettings');

        // 仅当结果为非空对象且包含任何键时缓存，否则返回空对象但不缓存
        if (result && Object.keys(result as any).length > 0) {
          settingsCache = result;
        }
        return result;
      } catch (error) {
        console.error('[SettingsOperations] Failed to get settings:', error);
        // 发生错误时返回空对象而不是默认设置，避免误判为已配置
        return {};
      } finally {
        settingsInFlight = null;
      }
    })();

    return settingsInFlight;
  },

  /**
   * 获取用户信息（baseUrl, username, password）
   */
  async getUserInfo(): Promise<{
    baseUrl: string;
    username: string;
    password: string;
  } | null> {
    try {
      const settings = await this.getSettings();
      if (!settings.baseUrl || !settings.username || !settings.password) {
        return null;
      }
      return {
        baseUrl: settings.baseUrl,
        username: settings.username,
        password: settings.password,
      };
    } catch (error) {
      console.error('[SettingsOperations] Failed to get user info:', error);
      return null;
    }
  },

  /**
   * 初始化设置（创建默认设置）
   */
  async initializeSettings(): Promise<ISettings> {
    try {
      return await retryOperation(async () => {
        const database = await getDatabase();
        const exists = await database.settings.exists();

        if (!exists) {
          const settings = await database.settings.save(DEFAULT_SETTINGS);
          console.log('[SettingsOperations] Settings initialized:', settings);
          return settings;
        }

        const current = await this.getSettings();
        return (current && Object.keys(current as any).length > 0)
          ? (current as ISettings)
          : DEFAULT_SETTINGS;
      }, 'initializeSettings');
    } catch (error) {
      console.error('[SettingsOperations] Failed to initialize settings:', error);
      throw error;
    }
  },

  /**
   * 设置用户信息
   */
  async setUserInfo(
    baseUrl: string,
    username: string,
    password: string
  ): Promise<ISettings> {
    try {
      return await retryOperation(async () => {
        const database = await getDatabase();
        const updated = await database.settings.update({
          baseUrl,
          username,
          password,
          updatedAt: new Date(),
        });
        console.log('[SettingsOperations] User info updated');
        // 更新缓存，避免后续再次读取
        settingsCache = updated;
        return updated;
      }, 'setUserInfo');
    } catch (error) {
      console.error('[SettingsOperations] Failed to set user info:', error);
      throw error;
    }
  },

  /**
   * 更新设置
   */
  async updateSettings(data: Partial<ISettings>): Promise<ISettings> {
    try {
      return await retryOperation(async () => {
        const database = await getDatabase();
        const updated = await database.settings.update({
          ...data,
          updatedAt: new Date(),
        });
        console.log('[SettingsOperations] Settings updated:', updated);
        settingsCache = updated;
        return updated;
      }, 'updateSettings');
    } catch (error) {
      console.error('[SettingsOperations] Failed to update settings:', error);
      throw error;
    }
  },

  /**
   * 重置设置为默认值
   */
  async resetSettings(): Promise<ISettings> {
    try {
      return await retryOperation(async () => {
        const database = await getDatabase();
        const reset = await database.settings.reset();
        console.log('[SettingsOperations] Settings reset to default');
        // 清除缓存
        settingsCache = null;
        return reset;
      }, 'resetSettings');
    } catch (error) {
      console.error('[SettingsOperations] Failed to reset settings:', error);
      throw error;
    }
  },

  /**
   * 清除缓存（强制下次读取从数据库获取）
   */
  clearCache(): void {
    settingsCache = null;
    settingsInFlight = null;
  },
};

// 模块级内存缓存与并发中的 Promise
let settingsCache: Partial<ISettings> | null = null;
let settingsInFlight: Promise<Partial<ISettings>> | null = null;

