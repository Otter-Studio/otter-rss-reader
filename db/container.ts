/**
 * 数据库容器 - 简化版
 * 
 * 使用单例模式管理数据库实例，避免复杂的依赖注入框架
 * 根据运行平台自动选择 Dexie（Web）或 SQLite（Mobile）
 */
import { Platform } from 'react-native';
import { IDatabase } from './abstractions';
import Database from './implementations/Database';

// 全局数据库实例
let databaseInstance: IDatabase | null = null;

/**
 * 初始化数据库实例
 * 
 * 检测运行平台并创建相应的数据库实例
 */
export async function initializeDatabase(): Promise<IDatabase> {
  if (databaseInstance) {
    console.log('[Database] Database already initialized');
    return databaseInstance;
  }

  let tempInstance: IDatabase | null = null;
  try {
    // 检测运行平台
    console.log('[Database] Platform detected:', Platform.OS);
    tempInstance = new Database();
    // 调用数据库的初始化方法
    await tempInstance.initialize();

    // 只在初始化成功后才设置全局实例
    databaseInstance = tempInstance;
    console.log('[Database] Database initialized successfully');
    return databaseInstance;
  } catch (error) {
    console.error('[Database] Failed to initialize database:', error);
    // 确保失败时不会缓存错误的实例
    databaseInstance = null;
    tempInstance = null;
    throw error;
  }
}

/**
 * 获取数据库实例（单例）
 * 
 * 如果未初始化，则自动初始化
 */
export async function getDatabase(): Promise<IDatabase> {
  if (!databaseInstance) {
    await initializeDatabase();
  }
  return databaseInstance!;
}

/**
 * 重置数据库实例（仅用于测试）
 */
export function resetDatabase(): void {
  databaseInstance = null;
  console.log('[Database] Database instance reset');
}

/**
 * 注册数据库依赖的兼容性函数
 * 
 * 保持与旧代码的兼容性，实际上现在只是初始化数据库
 */
export async function registerDatabaseDependencies(): Promise<void> {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('[Container] Failed to register database dependencies:', error);
    throw error;
  }
}

/**
 * 重置容器的兼容性函数（仅用于测试）
 */
export function resetContainer(): void {
  resetDatabase();
}


