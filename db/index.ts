/**
 * Otter RSS Reader - DB 层主入口
 * 
 * 统一导出所有模型、接口、实现和配置
 */

// ==================== 模型层导出 ====================
export * from './models';

// ==================== 抽象接口层导出 ====================
export * from './abstractions';

// ==================== 实现层导出 ====================
export * from './implementations';

// ==================== 依赖注入配置导出 ====================
export { registerDatabaseDependencies, getDatabase, resetContainer } from './container';

// ==================== Settings 操作导出 ====================
export { SettingsOperations } from './settings';

// ==================== Feed 操作导出 ====================
export { FeedOperations } from './feed';

// ==================== Article 操作导出 ====================
export { ArticleOperations } from './article';

// ==================== Database Manager 导出 ====================
export { dbManager } from './database';

// ==================== 类型重导出 ====================
export type { IDatabase } from './abstractions';
export type { IFeedRepository } from './abstractions';
export type { IItemRepository } from './abstractions';
export type { ICategoryRepository } from './abstractions';
export type { ITagRepository } from './abstractions';
export type { ISettingsRepository } from './abstractions';
export type { IHistoryRepository } from './abstractions';

export type { IFeed } from './models';
export type { IItem } from './models';
export type { ICategory } from './models';
export type { ITag } from './models';
export type { ISettings } from './models';
export type { IReadHistory } from './models';

