/**
 * 数据库主接口 - 所有数据库操作的入口
 */

import type { IFeedRepository } from './IFeedRepository';
import type { IItemRepository } from './IItemRepository';
import type { ICategoryRepository } from './ICategoryRepository';
import type { ITagRepository } from './ITagRepository';
import type { ISettingsRepository } from './ISettingsRepository';
import type { IHistoryRepository } from './IHistoryRepository';

/**
 * 数据库接口 - 所有数据库操作都通过这个接口进行
 */
export interface IDatabase {
  /**
   * 初始化数据库
   */
  initialize(): Promise<void>;

  /**
   * 关闭数据库连接
   */
  close(): Promise<void>;

  /**
   * 检查数据库是否已初始化
   */
  isInitialized(): boolean;

  /**
   * 清空所有数据（谨慎使用！）
   */
  clear(): Promise<void>;

  // ==================== 仓库访问器 ====================

  /** Feed 仓库 */
  readonly feeds: IFeedRepository;

  /** Item 仓库 */
  readonly items: IItemRepository;

  /** Category 仓库 */
  readonly categories: ICategoryRepository;

  /** Tag 仓库 */
  readonly tags: ITagRepository;

  /** Settings 仓库 */
  readonly settings: ISettingsRepository;

  /** ReadHistory 仓库 */
  readonly history: IHistoryRepository;
}
