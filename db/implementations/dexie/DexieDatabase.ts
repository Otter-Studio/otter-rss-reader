/**
 * Dexie 数据库实现
 * 
 * 为 Web 端提供基于 Dexie.js 的数据库实现
 */

import { IDatabase, IFeedRepository, IItemRepository, ICategoryRepository, ITagRepository, ISettingsRepository, IHistoryRepository } from '../../abstractions';
import {
  DexieFeedRepository,
  DexieItemRepository,
  DexieCategoryRepository,
  DexieTagRepository,
  DexieSettingsRepository,
  DexieHistoryRepository,
} from './repositories';

/**
 * Dexie 数据库实现
 */
export class DexieDatabase implements IDatabase {
  private _db: any = null;
  private _isInitialized = false;

  private _feedRepository: IFeedRepository | null = null;
  private _itemRepository: IItemRepository | null = null;
  private _categoryRepository: ICategoryRepository | null = null;
  private _tagRepository: ITagRepository | null = null;
  private _settingsRepository: ISettingsRepository | null = null;
  private _historyRepository: IHistoryRepository | null = null;

  private _ensureInitialized(): void {
    if (!this._isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  /**
   * 初始化数据库
   * 
   * 为 Web 平台初始化 Dexie 数据库
   */
  async initialize(): Promise<void> {
    try {
      // 如果已经初始化过，直接返回
      if (this._isInitialized && this._db) {
        console.log('[DexieDatabase] Database already initialized');
        return;
      }

      console.log('[DexieDatabase] Starting initialization...');

      // 检查环境 - 这是防御性检查，不应该在正常流程中触发
      if (typeof window === 'undefined') {
        const errorMsg = '[DexieDatabase] Cannot initialize in non-browser environment. Platform detection should have prevented this.';
        console.warn(errorMsg);
        throw new Error(errorMsg);
      }

      // 动态导入 Dexie（只在浏览器环境中可用）
      const Dexie = require('dexie');

      if (!Dexie) {
        throw new Error('[DexieDatabase] Dexie module not found - ensure dexie is installed');
      }

      console.log('[DexieDatabase] Creating Dexie instance...');
      this._db = new Dexie('OtterRSSReader');

      // 定义数据库模式
      console.log('[DexieDatabase] Defining schema...');
      this._db.version(1).stores({
        feeds: 'id',
        items: 'id, feedId, published',
        categories: 'id',
        tags: 'id',
        settings: 'id',
        readHistory: 'id, itemId, readAt',
      });

      // 打开数据库连接
      console.log('[DexieDatabase] Opening database...');
      await this._db.open();
      this._isInitialized = true;
      console.log('[DexieDatabase] Initialized successfully');
    } catch (error) {
      console.error('[DexieDatabase] Initialization failed:', error);
      this._isInitialized = false;
      this._db = null;
      throw error;
    }
  }

  /**
   * 关闭数据库
   */
  async close(): Promise<void> {
    try {
      if (this._db) {
        await this._db.close();
        this._db = null;
      }
      this._isInitialized = false;
      console.log('[DexieDatabase] Closed successfully');
    } catch (error) {
      console.error('[DexieDatabase] Close failed:', error);
      throw error;
    }
  }

  /**
   * 检查数据库是否已初始化
   */
  isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * 清空所有数据
   */
  async clear(): Promise<void> {
    try {
      if (!this._db) {
        throw new Error('Database not initialized');
      }

      await Promise.all([
        this._db.feeds.clear(),
        this._db.items.clear(),
        this._db.categories.clear(),
        this._db.tags.clear(),
        this._db.settings.clear(),
        this._db.readHistory.clear(),
      ]);

      console.log('[DexieDatabase] All data cleared');
    } catch (error) {
      console.error('[DexieDatabase] Clear failed:', error);
      throw error;
    }
  }

  // ==================== 仓库访问器 ====================

  get feeds(): IFeedRepository {
    if (!this._isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    if (!this._feedRepository) {
      this._feedRepository = new DexieFeedRepository(this._db);
    }
    return this._feedRepository!;
  }

  get items(): IItemRepository {
    if (!this._isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    if (!this._itemRepository) {
      this._itemRepository = new DexieItemRepository(this._db);
    }
    return this._itemRepository!;
  }

  get categories(): ICategoryRepository {
    if (!this._isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    if (!this._categoryRepository) {
      this._categoryRepository = new DexieCategoryRepository(this._db);
    }
    return this._categoryRepository!;
  }

  get tags(): ITagRepository {
    if (!this._isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    if (!this._tagRepository) {
      this._tagRepository = new DexieTagRepository(this._db);
    }
    return this._tagRepository!;
  }

  get settings(): ISettingsRepository {
    if (!this._isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    if (!this._settingsRepository) {
      this._settingsRepository = new DexieSettingsRepository(this._db);
    }
    return this._settingsRepository!;
  }

  get history(): IHistoryRepository {
    if (!this._historyRepository) {
      this._historyRepository = new DexieHistoryRepository(this._db);
    }
    return this._historyRepository!;
  }
}
