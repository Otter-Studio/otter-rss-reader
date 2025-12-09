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

// ==================== 数据库操作方法 ====================

/**
 * RSSFeed 操作
 */
export const FeedOperations = {
  /**
   * 添加新的 RSS Feed
   */
  addFeed(feedData: {
    id: string;
    title: string;
    url: string;
    description?: string;
    link?: string;
    image?: string;
    category?: string;
    author?: string;
    language?: string;
  }): RSSFeed {
    const realm = getRealm();
    let newFeed: RSSFeed;

    realm.write(() => {
      newFeed = realm.create<RSSFeed>('RSSFeed', {
        ...feedData,
        createdAt: new Date(),
      });
    });

    return newFeed!;
  },

  /**
   * 获取所有 Feed
   */
  getAllFeeds(): RSSFeed[] {
    const realm = getRealm();
    return Array.from(realm.objects<RSSFeed>('RSSFeed').sorted('createdAt', true));
  },

  /**
   * 获取活跃的 Feed
   */
  getActiveFeeds(): RSSFeed[] {
    const realm = getRealm();
    return Array.from(realm.objects<RSSFeed>('RSSFeed').filtered('isActive == true'));
  },

  /**
   * 按 ID 获取 Feed
   */
  getFeedById(id: string): RSSFeed | undefined {
    const realm = getRealm();
    const feed = realm.objectForPrimaryKey<RSSFeed>('RSSFeed', id);
    return feed || undefined;
  },

  /**
   * 更新 Feed
   */
  updateFeed(id: string, updates: Partial<Omit<RSSFeed, 'articles'>>): RSSFeed | undefined {
    const realm = getRealm();
    const feed = realm.objectForPrimaryKey<RSSFeed>('RSSFeed', id);

    if (feed) {
      realm.write(() => {
        Object.assign(feed, {
          ...updates,
          updatedAt: new Date(),
        });
      });
      return feed;
    }

    return undefined;
  },

  /**
   * 删除 Feed
   */
  deleteFeed(id: string): void {
    const realm = getRealm();
    const feed = realm.objectForPrimaryKey<RSSFeed>('RSSFeed', id);

    if (feed) {
      realm.write(() => {
        realm.delete(feed);
      });
    }
  },

  /**
   * 按类别获取 Feed
   */
  getFeedsByCategory(category: string): RSSFeed[] {
    const realm = getRealm();
    return Array.from(
      realm
        .objects<RSSFeed>('RSSFeed')
        .filtered('category == $0', category)
        .sorted('title')
    );
  },

  /**
   * 更新 Feed 的最后更新时间
   */
  updateLastUpdated(feedId: string): void {
    const realm = getRealm();
    const feed = realm.objectForPrimaryKey<RSSFeed>('RSSFeed', feedId);

    if (feed) {
      realm.write(() => {
        feed.lastUpdated = new Date();
      });
    }
  },
};

/**
 * RSSArticle 操作
 */
export const ArticleOperations = {
  /**
   * 添加新的文章
   */
  addArticle(articleData: {
    id: string;
    title: string;
    link: string;
    feedId: string;
    description?: string;
    content?: string;
    author?: string;
    image?: string;
    pubDate?: Date;
    guid?: string;
    category?: string;
  }): RSSArticle | null {
    const realm = getRealm();
    const feed = realm.objectForPrimaryKey<RSSFeed>('RSSFeed', articleData.feedId);

    if (!feed) {
      console.warn(`Feed with id ${articleData.feedId} not found`);
      return null;
    }

    let newArticle: RSSArticle;

    realm.write(() => {
      newArticle = realm.create<RSSArticle>('RSSArticle', {
        ...articleData,
        feed,
        createdAt: new Date(),
      });
    });

    return newArticle!;
  },

  /**
   * 获取 Feed 的所有文章
   */
  getArticlesByFeed(feedId: string, limit?: number): RSSArticle[] {
    const realm = getRealm();
    let articles = realm
      .objects<RSSArticle>('RSSArticle')
      .filtered('feed.id == $0', feedId)
      .sorted('pubDate', true);

    if (limit) {
      return Array.from(articles).slice(0, limit);
    }

    return Array.from(articles);
  },

  /**
   * 获取所有未读文章
   */
  getUnreadArticles(limit?: number): RSSArticle[] {
    const realm = getRealm();
    let articles = realm
      .objects<RSSArticle>('RSSArticle')
      .filtered('isRead == false')
      .sorted('pubDate', true);

    if (limit) {
      return Array.from(articles).slice(0, limit);
    }

    return Array.from(articles);
  },

  /**
   * 获取已星标文章
   */
  getStarredArticles(limit?: number): RSSArticle[] {
    const realm = getRealm();
    let articles = realm
      .objects<RSSArticle>('RSSArticle')
      .filtered('isStarred == true')
      .sorted('pubDate', true);

    if (limit) {
      return Array.from(articles).slice(0, limit);
    }

    return Array.from(articles);
  },

  /**
   * 按 ID 获取文章
   */
  getArticleById(id: string): RSSArticle | undefined {
    const realm = getRealm();
    const article = realm.objectForPrimaryKey<RSSArticle>('RSSArticle', id);
    return article || undefined;
  },

  /**
   * 标记文章为已读
   */
  markAsRead(id: string): RSSArticle | undefined {
    const realm = getRealm();
    const article = realm.objectForPrimaryKey<RSSArticle>('RSSArticle', id);

    if (article) {
      realm.write(() => {
        article.isRead = true;
      });
      return article;
    }

    return undefined;
  },

  /**
   * 标记文章为未读
   */
  markAsUnread(id: string): RSSArticle | undefined {
    const realm = getRealm();
    const article = realm.objectForPrimaryKey<RSSArticle>('RSSArticle', id);

    if (article) {
      realm.write(() => {
        article.isRead = false;
      });
      return article;
    }

    return undefined;
  },

  /**
   * 切换文章星标状态
   */
  toggleStar(id: string): RSSArticle | undefined {
    const realm = getRealm();
    const article = realm.objectForPrimaryKey<RSSArticle>('RSSArticle', id);

    if (article) {
      realm.write(() => {
        article.isStarred = !article.isStarred;
      });
      return article;
    }

    return undefined;
  },

  /**
   * 标记 Feed 的所有文章为已读
   */
  markFeedArticlesAsRead(feedId: string): void {
    const realm = getRealm();
    const articles = realm
      .objects<RSSArticle>('RSSArticle')
      .filtered('feed.id == $0 AND isRead == false', feedId);

    realm.write(() => {
      articles.forEach((article) => {
        article.isRead = true;
      });
    });
  },

  /**
   * 删除文章
   */
  deleteArticle(id: string): void {
    const realm = getRealm();
    const article = realm.objectForPrimaryKey<RSSArticle>('RSSArticle', id);

    if (article) {
      realm.write(() => {
        realm.delete(article);
      });
    }
  },

  /**
   * 删除旧文章（根据日期）
   */
  deleteOldArticles(daysOld: number = 30): void {
    const realm = getRealm();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldArticles = realm
      .objects<RSSArticle>('RSSArticle')
      .filtered('pubDate < $0', cutoffDate);

    realm.write(() => {
      realm.delete(oldArticles);
    });
  },

  /**
   * 获取文章数量统计
   */
  getArticleStats(): {
    total: number;
    unread: number;
    starred: number;
  } {
    const realm = getRealm();
    return {
      total: realm.objects<RSSArticle>('RSSArticle').length,
      unread: realm.objects<RSSArticle>('RSSArticle').filtered('isRead == false').length,
      starred: realm.objects<RSSArticle>('RSSArticle').filtered('isStarred == true').length,
    };
  },
};

/**
 * UserSettings 操作
 */
export const SettingsOperations = {
  /**
   * 初始化用户设置
   */
  initializeSettings(): UserSettings {
    const realm = getRealm();
    const existing = realm.objects<UserSettings>('UserSettings').length;

    if (existing > 0) {
      return realm.objects<UserSettings>('UserSettings')[0]!;
    }

    let settings: UserSettings;

    realm.write(() => {
      settings = realm.create<UserSettings>('UserSettings', {
        id: 'default-settings',
        theme: 'light',
        refreshInterval: 3600,
        articlesPerPage: 20,
        language: 'en',
        autoMarkAsRead: false,
        notificationsEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return settings!;
  },

  /**
   * 获取用户设置
   */
  getSettings(): UserSettings {
    const realm = getRealm();
    let settings = realm.objects<UserSettings>('UserSettings')[0];

    if (!settings) {
      settings = SettingsOperations.initializeSettings();
    }

    return settings;
  },

  /**
   * 更新用户设置
   */
  updateSettings(updates: Partial<Omit<UserSettings, 'id' | 'createdAt'>>): UserSettings {
    const realm = getRealm();
    const settings = SettingsOperations.getSettings();

    realm.write(() => {
      Object.assign(settings, {
        ...updates,
        updatedAt: new Date(),
      });
    });

    return settings;
  },

  /**
   * 重置为默认设置
   */
  resetToDefaults(): UserSettings {
    const realm = getRealm();
    const settings = SettingsOperations.getSettings();

    realm.write(() => {
      settings.theme = 'light';
      settings.refreshInterval = 3600;
      settings.articlesPerPage = 20;
      settings.language = 'en';
      settings.autoMarkAsRead = false;
      settings.notificationsEnabled = true;
      settings.updatedAt = new Date();
    });

    return settings;
  },
};

/**
 * ReadHistory 操作
 */
export const HistoryOperations = {
  /**
   * 添加阅读历史记录
   */
  addHistory(articleId: string, articleTitle: string, timeSpent: number = 0): ReadHistory {
    const realm = getRealm();
    let history: ReadHistory;

    realm.write(() => {
      history = realm.create<ReadHistory>('ReadHistory', {
        id: `${articleId}-${Date.now()}`,
        articleId,
        articleTitle,
        timeSpent,
        readAt: new Date(),
      });
    });

    return history!;
  },

  /**
   * 获取阅读历史
   */
  getHistory(limit: number = 50): ReadHistory[] {
    const realm = getRealm();
    return Array.from(realm.objects<ReadHistory>('ReadHistory').sorted('readAt', true)).slice(0, limit);
  },

  /**
   * 获取特定文章的阅读历史
   */
  getArticleHistory(articleId: string): ReadHistory[] {
    const realm = getRealm();
    return Array.from(
      realm
        .objects<ReadHistory>('ReadHistory')
        .filtered('articleId == $0', articleId)
        .sorted('readAt', true)
    );
  },

  /**
   * 清空阅读历史
   */
  clearHistory(): void {
    const realm = getRealm();
    const allHistory = realm.objects<ReadHistory>('ReadHistory');

    realm.write(() => {
      realm.delete(allHistory);
    });
  },

  /**
   * 删除指定日期前的历史
   */
  deleteOldHistory(daysOld: number = 90): void {
    const realm = getRealm();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldHistory = realm.objects<ReadHistory>('ReadHistory').filtered('readAt < $0', cutoffDate);

    realm.write(() => {
      realm.delete(oldHistory);
    });
  },
};

/**
 * 数据库工具函数
 */
export const DatabaseUtils = {
  /**
   * 清空所有数据
   */
  clearAllData(): void {
    const realm = getRealm();

    realm.write(() => {
      realm.deleteAll();
    });

    console.log('All data cleared');
  },

  /**
   * 获取数据库统计信息
   */
  getStatistics(): {
    feeds: number;
    articles: number;
    unreadArticles: number;
    starredArticles: number;
    historyEntries: number;
  } {
    const realm = getRealm();

    return {
      feeds: realm.objects<RSSFeed>('RSSFeed').length,
      articles: realm.objects<RSSArticle>('RSSArticle').length,
      unreadArticles: realm.objects<RSSArticle>('RSSArticle').filtered('isRead == false').length,
      starredArticles: realm.objects<RSSArticle>('RSSArticle').filtered('isStarred == true').length,
      historyEntries: realm.objects<ReadHistory>('ReadHistory').length,
    };
  },

  /**
   * 导出数据为 JSON
   */
  exportData(): object {
    const realm = getRealm();

    return {
      feeds: Array.from(realm.objects<RSSFeed>('RSSFeed')),
      articles: Array.from(realm.objects<RSSArticle>('RSSArticle')),
      settings: Array.from(realm.objects<UserSettings>('UserSettings')),
      history: Array.from(realm.objects<ReadHistory>('ReadHistory')),
    };
  },

  /**
   * 获取数据库文件路径
   */
  getRealmPath(): string {
    const realm = getRealm();
    return realm.path;
  },
};
