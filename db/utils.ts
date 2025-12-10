import { dbManager } from './database';
import { FeedOperations } from './feed';
import { ArticleOperations } from './article';
import { SettingsOperations } from './settings';
import { HistoryOperations } from './readHistory';

/**
 * 数据库工具类
 */
export class DatabaseUtils {
  /**
   * 获取数据库统计信息
   */
  static async getStatistics(): Promise<{
    feeds: number;
    activeFeeds: number;
    articles: number;
    unreadArticles: number;
    starredArticles: number;
    historyEntries: number;
  }> {
    const feedStats = await FeedOperations.getFeedStatistics();
    const articleStats = await ArticleOperations.getArticleStats();
    const historyCount = await HistoryOperations.getHistoryCount();

    return {
      feeds: feedStats.totalFeeds,
      activeFeeds: feedStats.activeFeeds,
      articles: articleStats.total,
      unreadArticles: articleStats.unread,
      starredArticles: articleStats.starred,
      historyEntries: historyCount,
    };
  }

  /**
   * 导出数据为 JSON
   */
  static async exportData(): Promise<{
    feeds: any[];
    articles: any[];
    settings: any;
    history: any[];
    exportDate: string;
  }> {
    const feeds = await FeedOperations.getAllFeeds();
    const articles = await dbManager.query(`SELECT * FROM rss_articles`);
    const settings = await SettingsOperations.getSettings();
    const history = await HistoryOperations.getHistory(Number.MAX_SAFE_INTEGER);

    return {
      feeds,
      articles,
      settings,
      history,
      exportDate: new Date().toISOString(),
    };
  }

  /**
   * 导入 JSON 数据
   */
  static async importData(data: {
    feeds?: any[];
    articles?: any[];
    settings?: any;
    history?: any[];
  }): Promise<void> {
    try {
      await dbManager.transaction(async (db) => {
        // 导入 Feed
        if (data.feeds && data.feeds.length > 0) {
          for (const feed of data.feeds) {
            await dbManager.execute(
              `INSERT OR REPLACE INTO rss_feeds (id, title, description, url, link, image, category, author, language, last_updated, created_at, is_active)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                feed.id,
                feed.title,
                feed.description || null,
                feed.url,
                feed.link || null,
                feed.image || null,
                feed.category || null,
                feed.author || null,
                feed.language || null,
                feed.last_updated || null,
                feed.created_at,
                feed.is_active ? 1 : 0,
              ]
            );
          }
        }

        // 导入 Article
        if (data.articles && data.articles.length > 0) {
          for (const article of data.articles) {
            await dbManager.execute(
              `INSERT OR REPLACE INTO rss_articles (id, title, description, content, author, link, image, pub_date, created_at, is_read, is_starred, feed_id, category, guid)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                article.id,
                article.title,
                article.description || null,
                article.content || null,
                article.author || null,
                article.link,
                article.image || null,
                article.pub_date || null,
                article.created_at,
                article.is_read ? 1 : 0,
                article.is_starred ? 1 : 0,
                article.feed_id,
                article.category || null,
                article.guid || null,
              ]
            );
          }
        }

        // 导入 Settings
        if (data.settings) {
          await dbManager.execute(
            `INSERT OR REPLACE INTO user_settings (id, theme, refresh_interval, articles_per_page, language, auto_mark_as_read, notifications_enabled, last_sync_time, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              data.settings.id || 'default-settings',
              data.settings.theme || 'light',
              data.settings.refresh_interval || 3600,
              data.settings.articles_per_page || 20,
              data.settings.language || 'en',
              data.settings.auto_mark_as_read ? 1 : 0,
              data.settings.notifications_enabled ? 1 : 0,
              data.settings.last_sync_time || null,
              data.settings.created_at || new Date().toISOString(),
              data.settings.updated_at || new Date().toISOString(),
            ]
          );
        }

        // 导入 History
        if (data.history && data.history.length > 0) {
          for (const record of data.history) {
            await dbManager.execute(
              `INSERT OR REPLACE INTO read_history (id, article_id, article_title, read_at, time_spent, scroll_position)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                record.id,
                record.article_id,
                record.article_title,
                record.read_at,
                record.time_spent || 0,
                record.scroll_position || 0,
              ]
            );
          }
        }
      });

      console.log('Data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  /**
   * 清空所有数据
   */
  static async clearAllData(): Promise<void> {
    await dbManager.clearAllData();
  }

  /**
   * 执行数据库清理
   */
  static async cleanup(): Promise<void> {
    try {
      // 删除 30 天前的文章
      const deletedArticles = await ArticleOperations.deleteOldArticles(30);
      console.log(`Deleted ${deletedArticles} old articles`);

      // 删除 90 天前的历史记录
      const deletedHistory = await HistoryOperations.deleteOldHistory(90);
      console.log(`Deleted ${deletedHistory} old history entries`);

      console.log('Database cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup database:', error);
      throw error;
    }
  }

  /**
   * 获取数据库文件大小（字节）
   */
  static async getDatabaseSize(): Promise<number> {
    // 注：这需要原生模块支持，在 expo-sqlite 中可能不直接支持
    // 作为替代，可以通过统计表的行数来估计大小
    const stats = await this.getStatistics();
    // 粗略估计：每行平均 1KB
    return (
      stats.feeds * 1000 +
      stats.articles * 2000 +
      stats.historyEntries * 500 +
      1000
    );
  }

  /**
   * 生成数据库报告
   */
  static async generateReport(): Promise<string> {
    try {
      const stats = await this.getStatistics();
      const readStats = await HistoryOperations.getReadStatistics();
      const dbSize = await this.getDatabaseSize();
      const settings = await SettingsOperations.getSettings();

      const report = `
========================================
        Database Report
========================================
Generated: ${new Date().toISOString()}

-- Feed Statistics --
Total Feeds: ${stats.feeds}
Active Feeds: ${stats.activeFeeds}

-- Article Statistics --
Total Articles: ${stats.articles}
Unread Articles: ${stats.unreadArticles}
Starred Articles: ${stats.starredArticles}

-- Reading Statistics --
Total Readings: ${readStats.totalReadings}
Articles Read: ${readStats.articlesRead}
Total Time Spent: ${readStats.totalTimeSpent} seconds
Average Time per Article: ${readStats.averageTimePerArticle} seconds

-- History --
History Entries: ${stats.historyEntries}

-- Settings --
Theme: ${settings?.theme}
Language: ${settings?.language}
Refresh Interval: ${settings?.refresh_interval} seconds
Auto Mark as Read: ${settings?.auto_mark_as_read ? 'Enabled' : 'Disabled'}
Notifications: ${settings?.notifications_enabled ? 'Enabled' : 'Disabled'}

-- Database Size --
Estimated Size: ${(dbSize / 1024 / 1024).toFixed(2)} MB

========================================
      End of Report
========================================
      `;

      return report;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  /**
   * 验证数据库完整性
   */
  static async validateIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // 检查孤立的文章（没有对应的 Feed）
      const orphanedArticles = await dbManager.query<{ count: number }>(
        `SELECT COUNT(*) as count FROM rss_articles 
         WHERE feed_id NOT IN (SELECT id FROM rss_feeds)`
      );

      if (orphanedArticles[0]?.count > 0) {
        issues.push(`Found ${orphanedArticles[0].count} orphaned articles`);
      }

      // 检查孤立的历史记录
      const orphanedHistory = await dbManager.query<{ count: number }>(
        `SELECT COUNT(*) as count FROM read_history 
         WHERE article_id NOT IN (SELECT id FROM rss_articles)`
      );

      if (orphanedHistory[0]?.count > 0) {
        issues.push(`Found ${orphanedHistory[0].count} orphaned history entries`);
      }

      // 检查设置是否存在
      const settings = await SettingsOperations.getSettings();
      if (!settings) {
        issues.push('User settings not found');
      }

      return {
        isValid: issues.length === 0,
        issues,
      };
    } catch (error) {
      console.error('Failed to validate database integrity:', error);
      return {
        isValid: false,
        issues: ['Database validation failed: ' + String(error)],
      };
    }
  }

  /**
   * 修复数据库完整性问题
   */
  static async repairIntegrity(): Promise<void> {
    try {
      // 删除孤立的文章
      await dbManager.execute(
        `DELETE FROM rss_articles 
         WHERE feed_id NOT IN (SELECT id FROM rss_feeds)`
      );

      // 删除孤立的历史记录
      await dbManager.execute(
        `DELETE FROM read_history 
         WHERE article_id NOT IN (SELECT id FROM rss_articles)`
      );

      // 确保设置存在
      const settings = await SettingsOperations.getSettings();
      if (!settings) {
        await SettingsOperations.initializeSettings();
      }

      console.log('Database integrity repaired');
    } catch (error) {
      console.error('Failed to repair database integrity:', error);
      throw error;
    }
  }
}
