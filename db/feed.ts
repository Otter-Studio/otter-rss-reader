import { dbManager } from './database';
import { nanoid } from 'nanoid/non-secure';

/**
 * RSS Feed 数据模型
 */
export interface RSSFeed {
  id: string;
  title: string;
  description?: string;
  url: string;
  link?: string;
  image?: string;
  category?: string;
  author?: string;
  language?: string;
  last_updated?: string;
  created_at: string;
  is_active: boolean;
}

/**
 * RSS Feed 操作类
 */
export class FeedOperations {
  /**
   * 添加新的 RSS Feed
   */
  static async addFeed(feedData: Omit<Partial<RSSFeed>, 'id' | 'created_at'> & {
    title: string;
    url: string;
  }): Promise<RSSFeed> {
    const id = nanoid();
    const createdAt = new Date().toISOString();

    await dbManager.execute(
      `INSERT INTO rss_feeds (id, title, description, url, link, image, category, author, language, created_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        feedData.title,
        feedData.description || null,
        feedData.url,
        feedData.link || null,
        feedData.image || null,
        feedData.category || null,
        feedData.author || null,
        feedData.language || null,
        createdAt,
        1,
      ]
    );

    return {
      id,
      created_at: createdAt,
      is_active: true,
      title: feedData.title,
      url: feedData.url,
      description: feedData.description,
      link: feedData.link,
      image: feedData.image,
      category: feedData.category,
      author: feedData.author,
      language: feedData.language,
    };
  }

  /**
   * 获取所有 Feed
   */
  static async getAllFeeds(): Promise<RSSFeed[]> {
    return await dbManager.query<RSSFeed>(
      `SELECT * FROM rss_feeds ORDER BY created_at DESC`
    );
  }

  /**
   * 获取活跃的 Feed
   */
  static async getActiveFeeds(): Promise<RSSFeed[]> {
    return await dbManager.query<RSSFeed>(
      `SELECT * FROM rss_feeds WHERE is_active = 1 ORDER BY created_at DESC`
    );
  }

  /**
   * 按 ID 获取 Feed
   */
  static async getFeedById(id: string): Promise<RSSFeed | null> {
    return await dbManager.queryOne<RSSFeed>(
      `SELECT * FROM rss_feeds WHERE id = ?`,
      [id]
    );
  }

  /**
   * 按 URL 获取 Feed
   */
  static async getFeedByUrl(url: string): Promise<RSSFeed | null> {
    return await dbManager.queryOne<RSSFeed>(
      `SELECT * FROM rss_feeds WHERE url = ?`,
      [url]
    );
  }

  /**
   * 更新 Feed
   */
  static async updateFeed(
    id: string,
    updates: Partial<Omit<RSSFeed, 'id' | 'created_at'>>
  ): Promise<RSSFeed | null> {
    const feed = await this.getFeedById(id);
    if (!feed) {
      return null;
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return feed;
    }

    updateValues.push(id);

    await dbManager.execute(
      `UPDATE rss_feeds SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    return await this.getFeedById(id);
  }

  /**
   * 删除 Feed
   */
  static async deleteFeed(id: string): Promise<boolean> {
    const result = await dbManager.execute(
      `DELETE FROM rss_feeds WHERE id = ?`,
      [id]
    );
    return result.changes > 0;
  }

  /**
   * 按类别获取 Feed
   */
  static async getFeedsByCategory(category: string): Promise<RSSFeed[]> {
    return await dbManager.query<RSSFeed>(
      `SELECT * FROM rss_feeds WHERE category = ? ORDER BY title`,
      [category]
    );
  }

  /**
   * 获取所有 Feed 的类别列表
   */
  static async getAllCategories(): Promise<string[]> {
    const results = await dbManager.query<{ category: string }>(
      `SELECT DISTINCT category FROM rss_feeds WHERE category IS NOT NULL ORDER BY category`
    );
    return results.map(r => r.category);
  }

  /**
   * 更新 Feed 的最后更新时间
   */
  static async updateLastUpdated(feedId: string): Promise<void> {
    const lastUpdated = new Date().toISOString();
    await dbManager.execute(
      `UPDATE rss_feeds SET last_updated = ? WHERE id = ?`,
      [lastUpdated, feedId]
    );
  }

  /**
   * 激活或禁用 Feed
   */
  static async setFeedActive(id: string, isActive: boolean): Promise<RSSFeed | null> {
    return await this.updateFeed(id, { is_active: isActive });
  }

  /**
   * 获取 Feed 的文章数量
   */
  static async getFeedArticleCount(feedId: string): Promise<number> {
    const result = await dbManager.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM rss_articles WHERE feed_id = ?`,
      [feedId]
    );
    return result?.count || 0;
  }

  /**
   * 搜索 Feed
   */
  static async searchFeeds(keyword: string): Promise<RSSFeed[]> {
    const searchTerm = `%${keyword}%`;
    return await dbManager.query<RSSFeed>(
      `SELECT * FROM rss_feeds 
       WHERE title LIKE ? OR description LIKE ? OR author LIKE ?
       ORDER BY title`,
      [searchTerm, searchTerm, searchTerm]
    );
  }

  /**
   * 获取需要更新的 Feed（基于最后更新时间）
   */
  static async getFeedsNeedingUpdate(intervalMinutes: number = 60): Promise<RSSFeed[]> {
    const cutoffTime = new Date(Date.now() - intervalMinutes * 60 * 1000).toISOString();
    return await dbManager.query<RSSFeed>(
      `SELECT * FROM rss_feeds 
       WHERE is_active = 1 AND (last_updated IS NULL OR last_updated < ?)
       ORDER BY last_updated ASC`,
      [cutoffTime]
    );
  }

  /**
   * 批量添加 Feed
   */
  static async addFeedsInBatch(feedsData: Array<Omit<Partial<RSSFeed>, 'id' | 'created_at'> & {
    title: string;
    url: string;
  }>): Promise<RSSFeed[]> {
    const feeds: RSSFeed[] = [];
    const createdAt = new Date().toISOString();

    const statements = feedsData.map(feedData => ({
      sql: `INSERT INTO rss_feeds (id, title, description, url, link, image, category, author, language, created_at, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        nanoid(),
        feedData.title,
        feedData.description || null,
        feedData.url,
        feedData.link || null,
        feedData.image || null,
        feedData.category || null,
        feedData.author || null,
        feedData.language || null,
        createdAt,
        1,
      ],
    }));

    await dbManager.batch(statements);

    // 重新获取添加的 Feed
    return await this.getAllFeeds();
  }

  /**
   * 获取数据库中的 Feed 统计信息
   */
  static async getFeedStatistics(): Promise<{
    totalFeeds: number;
    activeFeeds: number;
    totalArticles: number;
  }> {
    const totalFeeds = await dbManager.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM rss_feeds`
    );
    const activeFeeds = await dbManager.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM rss_feeds WHERE is_active = 1`
    );
    const totalArticles = await dbManager.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM rss_articles`
    );

    return {
      totalFeeds: totalFeeds?.count || 0,
      activeFeeds: activeFeeds?.count || 0,
      totalArticles: totalArticles?.count || 0,
    };
  }
}
