import Realm from 'realm';

// ==================== 数据模型定义 ====================

/**
 * RSS Feed 模型
 */
export class RSSFeed extends Realm.Object<RSSFeed> {
  static schema: Realm.ObjectSchema = {
    name: 'RSSFeed',
    primaryKey: 'id',
    properties: {
      id: 'string',
      title: 'string',
      description: 'string?',
      url: 'string',
      link: 'string?',
      image: 'string?', // 源的图标/图片 URL
      category: 'string?',
      author: 'string?',
      language: 'string?',
      lastUpdated: 'date?',
      createdAt: { type: 'date', default: () => new Date() },
      isActive: { type: 'bool', default: true },
      articles: 'RSSArticle[]', // 一对多关系
    },
  };

  id!: string;
  title!: string;
  description?: string;
  url!: string;
  link?: string;
  image?: string;
  category?: string;
  author?: string;
  language?: string;
  lastUpdated?: Date;
  createdAt!: Date;
  isActive!: boolean;
  articles!: Realm.List<RSSArticle>;
}

/**
 * RSS 文章模型
 */
export class RSSArticle extends Realm.Object<RSSArticle> {
  static schema: Realm.ObjectSchema = {
    name: 'RSSArticle',
    primaryKey: 'id',
    properties: {
      id: 'string',
      title: 'string',
      description: 'string?',
      content: 'string?',
      author: 'string?',
      link: 'string',
      image: 'string?',
      pubDate: 'date?',
      createdAt: { type: 'date', default: () => new Date() },
      isRead: { type: 'bool', default: false },
      isStarred: { type: 'bool', default: false },
      feed: 'RSSFeed', // 关联的 Feed
      category: 'string?',
      guid: 'string?', // 文章的全局唯一标识
    },
  };

  id!: string;
  title!: string;
  description?: string;
  content?: string;
  author?: string;
  link!: string;
  image?: string;
  pubDate?: Date;
  createdAt!: Date;
  isRead!: boolean;
  isStarred!: boolean;
  feed!: RSSFeed;
  category?: string;
  guid?: string;
}

/**
 * 用户设置模型
 */
export class UserSettings extends Realm.Object<UserSettings> {
  static schema: Realm.ObjectSchema = {
    name: 'UserSettings',
    primaryKey: 'id',
    properties: {
      id: 'string',
      theme: { type: 'string', default: 'light' }, // 'light' | 'dark' | 'system'
      refreshInterval: { type: 'int', default: 3600 }, // 秒为单位
      articlesPerPage: { type: 'int', default: 20 },
      language: { type: 'string', default: 'en' },
      autoMarkAsRead: { type: 'bool', default: false },
      notificationsEnabled: { type: 'bool', default: true },
      lastSyncTime: 'date?',
      createdAt: { type: 'date', default: () => new Date() },
      updatedAt: { type: 'date', default: () => new Date() },
    },
  };

  id!: string;
  theme!: string;
  refreshInterval!: number;
  articlesPerPage!: number;
  language!: string;
  autoMarkAsRead!: boolean;
  notificationsEnabled!: boolean;
  lastSyncTime?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}

/**
 * 阅读历史模型
 */
export class ReadHistory extends Realm.Object<ReadHistory> {
  static schema: Realm.ObjectSchema = {
    name: 'ReadHistory',
    primaryKey: 'id',
    properties: {
      id: 'string',
      articleId: 'string',
      articleTitle: 'string',
      readAt: { type: 'date', default: () => new Date() },
      timeSpent: { type: 'int', default: 0 }, // 秒为单位
      scrollPosition: { type: 'float', default: 0 },
    },
  };

  id!: string;
  articleId!: string;
  articleTitle!: string;
  readAt!: Date;
  timeSpent!: number;
  scrollPosition!: number;
}
