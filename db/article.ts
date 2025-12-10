import { dbManager } from './database';
import { nanoid } from 'nanoid/non-secure';

/**
 * RSS Article 数据模型
 */
export interface RSSArticle {
  id: string;
  title: string;
  description?: string;
  content?: string;
  author?: string;
  link: string;
  image?: string;
  pub_date?: string;
  created_at: string;
  is_read: boolean;
  is_starred: boolean;
  feed_id: string;
  category?: string;
  guid?: string;
}

/**
 * RSS Article 操作类
 */
export class ArticleOperations {
  /**
   * 添加新的文章
   */
  static async addArticle(articleData: Omit<Partial<RSSArticle>, 'id' | 'created_at'> & {
    title: string;
    link: string;
    feed_id: string;
  }): Promise<RSSArticle> {
    const id = nanoid();
    const createdAt = new Date().toISOString();

    await dbManager.execute(
      `INSERT INTO rss_articles (id, title, description, content, author, link, image, pub_date, feed_id, category, guid, is_read, is_starred, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        articleData.title,
        articleData.description || null,
        articleData.content || null,
        articleData.author || null,
        articleData.link,
        articleData.image || null,
        articleData.pub_date || null,
        articleData.feed_id,
        articleData.category || null,
        articleData.guid || null,
        0,
        0,
        createdAt,
      ]
    );

    return {
      id,
      created_at: createdAt,
      is_read: false,
      is_starred: false,
      title: articleData.title,
      link: articleData.link,
      feed_id: articleData.feed_id,
      description: articleData.description,
      content: articleData.content,
      author: articleData.author,
      image: articleData.image,
      pub_date: articleData.pub_date,
      category: articleData.category,
      guid: articleData.guid,
    };
  }

  /**
   * 获取 Feed 的所有文章
   */
  static async getArticlesByFeed(feedId: string, limit?: number, offset: number = 0): Promise<RSSArticle[]> {
    let sql = `SELECT * FROM rss_articles WHERE feed_id = ? ORDER BY pub_date DESC`;
    const params: any[] = [feedId];

    if (limit) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    return await dbManager.query<RSSArticle>(sql, params);
  }

  /**
   * 获取所有未读文章
   */
  static async getUnreadArticles(limit?: number, offset: number = 0): Promise<RSSArticle[]> {
    let sql = `SELECT * FROM rss_articles WHERE is_read = 0 ORDER BY pub_date DESC`;
    const params: any[] = [];

    if (limit) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    return await dbManager.query<RSSArticle>(sql, params);
  }

  /**
   * 获取已星标文章
   */
  static async getStarredArticles(limit?: number, offset: number = 0): Promise<RSSArticle[]> {
    let sql = `SELECT * FROM rss_articles WHERE is_starred = 1 ORDER BY pub_date DESC`;
    const params: any[] = [];

    if (limit) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    return await dbManager.query<RSSArticle>(sql, params);
  }

  /**
   * 按 ID 获取文章
   */
  static async getArticleById(id: string): Promise<RSSArticle | null> {
    return await dbManager.queryOne<RSSArticle>(
      `SELECT * FROM rss_articles WHERE id = ?`,
      [id]
    );
  }

  /**
   * 按 GUID 获取文章
   */
  static async getArticleByGuid(guid: string): Promise<RSSArticle | null> {
    return await dbManager.queryOne<RSSArticle>(
      `SELECT * FROM rss_articles WHERE guid = ?`,
      [guid]
    );
  }

  /**
   * 标记文章为已读
   */
  static async markAsRead(id: string): Promise<RSSArticle | null> {
    await dbManager.execute(
      `UPDATE rss_articles SET is_read = 1 WHERE id = ?`,
      [id]
    );
    return await this.getArticleById(id);
  }

  /**
   * 标记文章为未读
   */
  static async markAsUnread(id: string): Promise<RSSArticle | null> {
    await dbManager.execute(
      `UPDATE rss_articles SET is_read = 0 WHERE id = ?`,
      [id]
    );
    return await this.getArticleById(id);
  }

  /**
   * 切换文章星标状态
   */
  static async toggleStar(id: string): Promise<RSSArticle | null> {
    const article = await this.getArticleById(id);
    if (!article) {
      return null;
    }

    await dbManager.execute(
      `UPDATE rss_articles SET is_starred = ? WHERE id = ?`,
      [article.is_starred ? 0 : 1, id]
    );

    return await this.getArticleById(id);
  }

  /**
   * 设置文章星标状态
   */
  static async setStar(id: string, isStarred: boolean): Promise<RSSArticle | null> {
    await dbManager.execute(
      `UPDATE rss_articles SET is_starred = ? WHERE id = ?`,
      [isStarred ? 1 : 0, id]
    );
    return await this.getArticleById(id);
  }

  /**
   * 标记 Feed 的所有文章为已读
   */
  static async markFeedArticlesAsRead(feedId: string): Promise<void> {
    await dbManager.execute(
      `UPDATE rss_articles SET is_read = 1 WHERE feed_id = ? AND is_read = 0`,
      [feedId]
    );
  }

  /**
   * 标记所有文章为已读
   */
  static async markAllAsRead(): Promise<void> {
    await dbManager.execute(
      `UPDATE rss_articles SET is_read = 1 WHERE is_read = 0`
    );
  }

  /**
   * 删除文章
   */
  static async deleteArticle(id: string): Promise<boolean> {
    const result = await dbManager.execute(
      `DELETE FROM rss_articles WHERE id = ?`,
      [id]
    );
    return result.changes > 0;
  }

  /**
   * 删除 Feed 的所有文章
   */
  static async deleteArticlesByFeed(feedId: string): Promise<number> {
    const result = await dbManager.execute(
      `DELETE FROM rss_articles WHERE feed_id = ?`,
      [feedId]
    );
    return result.changes;
  }

  /**
   * 删除旧文章（根据日期）
   */
  static async deleteOldArticles(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();
    const result = await dbManager.execute(
      `DELETE FROM rss_articles WHERE pub_date < ? AND is_starred = 0`,
      [cutoffDate]
    );
    return result.changes;
  }

  /**
   * 获取文章数量统计
   */
  static async getArticleStats(): Promise<{
    total: number;
    unread: number;
    starred: number;
  }> {
    const total = await dbManager.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM rss_articles`
    );
    const unread = await dbManager.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM rss_articles WHERE is_read = 0`
    );
    const starred = await dbManager.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM rss_articles WHERE is_starred = 1`
    );

    return {
      total: total?.count || 0,
      unread: unread?.count || 0,
      starred: starred?.count || 0,
    };
  }

  /**
   * 搜索文章
   */
  static async searchArticles(keyword: string, limit?: number, offset: number = 0): Promise<RSSArticle[]> {
    const searchTerm = `%${keyword}%`;
    let sql = `SELECT * FROM rss_articles 
              WHERE title LIKE ? OR description LIKE ? OR content LIKE ?
              ORDER BY pub_date DESC`;
    const params: any[] = [searchTerm, searchTerm, searchTerm];

    if (limit) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    return await dbManager.query<RSSArticle>(sql, params);
  }

  /**
   * 获取未读文章数量
   */
  static async getUnreadCount(): Promise<number> {
    const result = await dbManager.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM rss_articles WHERE is_read = 0`
    );
    return result?.count || 0;
  }

  /**
   * 获取 Feed 的未读文章数量
   */
  static async getFeedUnreadCount(feedId: string): Promise<number> {
    const result = await dbManager.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM rss_articles WHERE feed_id = ? AND is_read = 0`,
      [feedId]
    );
    return result?.count || 0;
  }

  /**
   * 批量添加文章
   */
  static async addArticlesInBatch(articlesData: Array<Omit<Partial<RSSArticle>, 'id' | 'created_at'> & {
    title: string;
    link: string;
    feed_id: string;
  }>): Promise<void> {
    const createdAt = new Date().toISOString();

    const statements = articlesData.map(articleData => ({
      sql: `INSERT OR IGNORE INTO rss_articles (id, title, description, content, author, link, image, pub_date, feed_id, category, guid, is_read, is_starred, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        nanoid(),
        articleData.title,
        articleData.description || null,
        articleData.content || null,
        articleData.author || null,
        articleData.link,
        articleData.image || null,
        articleData.pub_date || null,
        articleData.feed_id,
        articleData.category || null,
        articleData.guid || null,
        0,
        0,
        createdAt,
      ],
    }));

    await dbManager.batch(statements);
  }

  /**
   * 获取最近的文章
   */
  static async getRecentArticles(limit: number = 50): Promise<RSSArticle[]> {
    return await dbManager.query<RSSArticle>(
      `SELECT * FROM rss_articles ORDER BY pub_date DESC LIMIT ?`,
      [limit]
    );
  }

  /**
   * 获取特定时间范围内的文章
   */
  static async getArticlesInDateRange(startDate: string, endDate: string): Promise<RSSArticle[]> {
    return await dbManager.query<RSSArticle>(
      `SELECT * FROM rss_articles WHERE pub_date >= ? AND pub_date <= ? ORDER BY pub_date DESC`,
      [startDate, endDate]
    );
  }
}
