import Realm from 'realm';
import { RSSFeed, RSSArticle, UserSettings, ReadHistory } from './models';

// ==================== 数据库初始化 ====================

let realmInstance: Realm | null = null;

/**
 * 初始化 Realm 数据库
 */
export async function initializeDatabase(): Promise<Realm> {
  if (realmInstance) {
    return realmInstance;
  }

  try {
    realmInstance = await Realm.open({
      schema: [RSSFeed, RSSArticle, UserSettings, ReadHistory],
      schemaVersion: 1,
      onMigration: (oldRealm, newRealm) => {
        // 处理数据库迁移
        console.log('Database migration completed');
      },
    });

    console.log('Database initialized successfully');
    return realmInstance;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * 获取 Realm 实例
 */
export function getRealm(): Realm {
  if (!realmInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return realmInstance;
}

/**
 * 关闭数据库连接
 */
export function closeDatabase(): void {
  if (realmInstance) {
    realmInstance.close();
    realmInstance = null;
    console.log('Database closed');
  }
}
