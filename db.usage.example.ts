/**
 * Realm 数据库使用示例
 * 这个文件展示了如何使用 db.ts 中的各种数据库操作
 */

import {
  initializeDatabase,
  closeDatabase,
  RSSFeed,
  RSSArticle,
  FeedOperations,
  ArticleOperations,
  SettingsOperations,
  HistoryOperations,
  DatabaseUtils,
} from './db';

// ==================== 初始化数据库 ====================

/**
 * 应用启动时初始化数据库
 */
export async function setupDatabase() {
  try {
    await initializeDatabase();
    console.log('Database setup completed');

    // 初始化用户设置
    SettingsOperations.initializeSettings();
  } catch (error) {
    console.error('Failed to setup database:', error);
  }
}

// ==================== Feed 管理示例 ====================

/**
 * 添加新的 RSS Feed
 */
export function addNewFeed() {
  const newFeed = FeedOperations.addFeed({
    id: 'feed-' + Date.now(),
    title: 'My Awesome Blog',
    url: 'https://example.com/rss',
    description: 'A blog about technology',
    link: 'https://example.com',
    image: 'https://example.com/logo.png',
    category: 'Technology',
    author: 'John Doe',
    language: 'en',
  });

  console.log('New feed added:', newFeed.id, newFeed.title);
  return newFeed;
}

/**
 * 获取所有 Feed
 */
export function getAllFeeds() {
  const feeds = FeedOperations.getAllFeeds();
  console.log(`Total feeds: ${feeds.length}`);

  feeds.forEach((feed) => {
    console.log(`- ${feed.title} (${feed.articles.length} articles)`);
  });

  return feeds;
}

/**
 * 获取特定类别的 Feed
 */
export function getFeedsByCategory(category: string) {
  const feeds = FeedOperations.getFeedsByCategory(category);
  console.log(`Feeds in category "${category}": ${feeds.length}`);
  return feeds;
}

/**
 * 更新 Feed 信息
 */
export function updateFeedInfo(feedId: string) {
  const updated = FeedOperations.updateFeed(feedId, {
    title: 'Updated Blog Title',
    description: 'Updated description',
  });

  if (updated) {
    console.log('Feed updated:', updated.title);
  }

  return updated;
}

/**
 * 删除 Feed
 */
export function removeFeed(feedId: string) {
  FeedOperations.deleteFeed(feedId);
  console.log(`Feed ${feedId} deleted`);
}

// ==================== 文章管理示例 ====================

/**
 * 添加新文章
 */
export function addNewArticle(feedId: string) {
  const article = ArticleOperations.addArticle({
    id: 'article-' + Date.now(),
    title: 'Amazing Article',
    link: 'https://example.com/article-1',
    feedId: feedId,
    description: 'This is an interesting article',
    content: '<p>Full article content here...</p>',
    author: 'Jane Doe',
    image: 'https://example.com/article-image.jpg',
    pubDate: new Date(),
    guid: 'guid-12345',
    category: 'Technology',
  });

  if (article) {
    console.log('Article added:', article.title);
  }

  return article;
}

/**
 * 获取 Feed 的所有文章
 */
export function getFeedArticles(feedId: string, limit?: number) {
  const articles = ArticleOperations.getArticlesByFeed(feedId, limit);
  console.log(`Articles in feed: ${articles.length}`);
  return articles;
}

/**
 * 获取所有未读文章
 */
export function getUnreadArticles(limit?: number) {
  const articles = ArticleOperations.getUnreadArticles(limit);
  console.log(`Unread articles: ${articles.length}`);

  articles.forEach((article) => {
    console.log(`- [${article.feed.title}] ${article.title}`);
  });

  return articles;
}

/**
 * 获取所有已星标文章
 */
export function getStarredArticles() {
  const articles = ArticleOperations.getStarredArticles();
  console.log(`Starred articles: ${articles.length}`);
  return articles;
}

/**
 * 标记文章为已读
 */
export function markArticleAsRead(articleId: string) {
  const article = ArticleOperations.markAsRead(articleId);
  if (article) {
    console.log(`Article marked as read: ${article.title}`);
  }
  return article;
}

/**
 * 标记文章为未读
 */
export function markArticleAsUnread(articleId: string) {
  const article = ArticleOperations.markAsUnread(articleId);
  if (article) {
    console.log(`Article marked as unread: ${article.title}`);
  }
  return article;
}

/**
 * 切换文章星标
 */
export function toggleArticleStar(articleId: string) {
  const article = ArticleOperations.toggleStar(articleId);
  if (article) {
    console.log(`Article star toggled: ${article.isStarred ? 'starred' : 'unstarred'}`);
  }
  return article;
}

/**
 * 标记 Feed 的所有文章为已读
 */
export function markAllFeedArticlesAsRead(feedId: string) {
  ArticleOperations.markFeedArticlesAsRead(feedId);
  console.log(`All articles in feed ${feedId} marked as read`);
}

/**
 * 删除旧文章（30 天前）
 */
export function cleanupOldArticles(daysOld: number = 30) {
  ArticleOperations.deleteOldArticles(daysOld);
  console.log(`Articles older than ${daysOld} days deleted`);
}

/**
 * 获取文章统计信息
 */
export function getArticleStats() {
  const stats = ArticleOperations.getArticleStats();
  console.log('Article Statistics:', {
    total: stats.total,
    unread: stats.unread,
    starred: stats.starred,
  });
  return stats;
}

// ==================== 用户设置示例 ====================

/**
 * 获取用户设置
 */
export function getUserSettings() {
  const settings = SettingsOperations.getSettings();
  console.log('User Settings:', {
    theme: settings.theme,
    language: settings.language,
    refreshInterval: settings.refreshInterval,
    autoMarkAsRead: settings.autoMarkAsRead,
  });
  return settings;
}

/**
 * 更新用户设置
 */
export function updateUserSettings() {
  const updated = SettingsOperations.updateSettings({
    theme: 'dark',
    language: 'zh',
    refreshInterval: 1800, // 30 分钟
    autoMarkAsRead: true,
  });

  console.log('Settings updated:', {
    theme: updated.theme,
    language: updated.language,
  });

  return updated;
}

/**
 * 重置设置为默认值
 */
export function resetSettings() {
  const reset = SettingsOperations.resetToDefaults();
  console.log('Settings reset to defaults');
  return reset;
}

// ==================== 阅读历史示例 ====================

/**
 * 添加阅读历史记录
 */
export function addReadingHistory(articleId: string, articleTitle: string, timeSpent: number) {
  const history = HistoryOperations.addHistory(articleId, articleTitle, timeSpent);
  console.log(`Reading history added: ${articleTitle} (${timeSpent}s)`);
  return history;
}

/**
 * 获取最近的阅读历史
 */
export function getRecentReadingHistory(limit: number = 20) {
  const history = HistoryOperations.getHistory(limit);
  console.log(`Recent reading history (${history.length} items):`);

  history.forEach((item) => {
    console.log(`- ${item.articleTitle} (${item.timeSpent}s) at ${item.readAt}`);
  });

  return history;
}

/**
 * 获取特定文章的阅读历史
 */
export function getArticleReadingHistory(articleId: string) {
  const history = HistoryOperations.getArticleHistory(articleId);
  console.log(`Article ${articleId} read ${history.length} times`);
  return history;
}

/**
 * 清空所有阅读历史
 */
export function clearAllReadingHistory() {
  HistoryOperations.clearHistory();
  console.log('All reading history cleared');
}

/**
 * 删除 90 天前的阅读历史
 */
export function cleanupOldHistory() {
  HistoryOperations.deleteOldHistory(90);
  console.log('Old reading history cleaned up');
}

// ==================== 数据库工具示例 ====================

/**
 * 获取数据库统计信息
 */
export function getDatabaseStatistics() {
  const stats = DatabaseUtils.getStatistics();
  console.log('Database Statistics:', stats);
  return stats;
}

/**
 * 导出所有数据为 JSON
 */
export function exportDataAsJSON() {
  const data = DatabaseUtils.exportData();
  console.log('Exported data:', JSON.stringify(data, null, 2));
  return data;
}

/**
 * 获取数据库路径
 */
export function getDBPath() {
  const path = DatabaseUtils.getRealmPath();
  console.log('Database path:', path);
  return path;
}

/**
 * 清空所有数据（谨慎使用！）
 */
export function clearAllData() {
  if (confirm('Are you sure you want to clear all data?')) {
    DatabaseUtils.clearAllData();
    console.log('All data cleared');
  }
}

// ==================== 应用关闭 ====================

/**
 * 应用关闭时清理资源
 */
export function cleanupDatabase() {
  closeDatabase();
  console.log('Database cleanup completed');
}

// ==================== 完整工作流示例 ====================

/**
 * 完整的工作流示例
 */
export async function completeWorkflowExample() {
  // 1. 初始化数据库
  await setupDatabase();

  // 2. 添加 Feed
  const feed1 = addNewFeed();
  const feed2 = FeedOperations.addFeed({
    id: 'feed-2',
    title: 'Tech News Daily',
    url: 'https://technewsdaily.com/rss',
  });

  // 3. 添加文章
  if (feed1) {
    const article1 = addNewArticle(feed1.id);
    const article2 = ArticleOperations.addArticle({
      id: 'article-2',
      title: 'Another Great Post',
      link: 'https://example.com/article-2',
      feedId: feed1.id,
      pubDate: new Date(),
    });
  }

  // 4. 获取统计信息
  getDatabaseStatistics();
  getArticleStats();

  // 5. 标记文章
  const articles = getUnreadArticles(5);
  if (articles.length > 0) {
    markArticleAsRead(articles[0].id);
    toggleArticleStar(articles[0].id);
  }

  // 6. 添加阅读历史
  if (articles.length > 0) {
    addReadingHistory(articles[0].id, articles[0].title, 120);
  }

  // 7. 获取用户设置
  getUserSettings();
  updateUserSettings();

  // 8. 清理资源
  cleanupDatabase();
}
