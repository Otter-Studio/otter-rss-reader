/**
 * 数据库模块导出
 */

export {
  DatabaseManager,
  dbManager,
  initializeDatabase,
  closeDatabase,
} from './database';

export type { RSSFeed } from './feed';
export { FeedOperations } from './feed';

export type { RSSArticle } from './article';
export { ArticleOperations } from './article';

export type { UserSettings } from './settings';
export { SettingsOperations } from './settings';

export type { ReadHistory } from './readHistory';
export { HistoryOperations } from './readHistory';

export { DatabaseUtils } from './utils';
