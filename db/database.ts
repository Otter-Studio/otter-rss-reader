/**
 * Database Manager - 数据库管理器
 * 
 * 提供一个单一的入口点来初始化和管理数据库
 */

import { registerDatabaseDependencies } from './container';

// ==================== 内部状态 ====================
let isInitialized = false;

/**
 * 数据库管理器对象
 * 
 * 提供数据库的初始化和管理功能
 */
export const dbManager = {
  /**
   * 初始化数据库
   * 
   * 这个方法应该在应用启动时被调用，注册所有数据库依赖
   */
  async initialize(): Promise<void> {
    try {
      if (isInitialized) {
        console.log('[dbManager] Database already initialized');
        return;
      }

      console.log('[dbManager] Initializing database...');

      // 注册数据库依赖（根据平台自动选择 Dexie 或 Realm）
      await registerDatabaseDependencies();

      isInitialized = true;
      console.log('[dbManager] Database initialized successfully');
    } catch (error) {
      console.error('[dbManager] Failed to initialize database:', error);
      throw error;
    }
  },

  /**
   * 检查数据库是否已初始化
   */
  isInitialized(): boolean {
    return isInitialized;
  },
};
