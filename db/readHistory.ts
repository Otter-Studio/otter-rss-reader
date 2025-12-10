import { dbManager } from './database';
import { nanoid } from 'nanoid/non-secure';

/**
 * 阅读历史数据模型
 */
export interface ReadHistory {
  id: string;
  article_id: string;
  article_title: string;
  read_at: string;
  time_spent: number;
  scroll_position: number;
}

/**
 * 阅读历史操作类
 */
export class HistoryOperations {
  /**
   * 添加阅读历史记录
   */
  static async addHistory(
    articleId: string,
    articleTitle: string,
    timeSpent: number = 0,
    scrollPosition: number = 0
  ): Promise<ReadHistory> {
    const id = nanoid();
    const readAt = new Date().toISOString();

    await dbManager.execute(
      `INSERT INTO read_history (id, article_id, article_title, read_at, time_spent, scroll_position)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, articleId, articleTitle, readAt, timeSpent, scrollPosition]
    );

    return {
      id,
      article_id: articleId,
      article_title: articleTitle,
      read_at: readAt,
      time_spent: timeSpent,
      scroll_position: scrollPosition,
    };
  }

  /**
   * 获取阅读历史
   */
  static async getHistory(limit: number = 50, offset: number = 0): Promise<ReadHistory[]> {
    return await dbManager.query<ReadHistory>(
      `SELECT * FROM read_history ORDER BY read_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
  }

  /**
   * 获取特定文章的阅读历史
   */
  static async getArticleHistory(articleId: string): Promise<ReadHistory[]> {
    return await dbManager.query<ReadHistory>(
      `SELECT * FROM read_history WHERE article_id = ? ORDER BY read_at DESC`,
      [articleId]
    );
  }

  /**
   * 获取特定文章的最后一次阅读记录
   */
  static async getLastArticleHistory(articleId: string): Promise<ReadHistory | null> {
    return await dbManager.queryOne<ReadHistory>(
      `SELECT * FROM read_history WHERE article_id = ? ORDER BY read_at DESC LIMIT 1`,
      [articleId]
    );
  }

  /**
   * 更新阅读时长
   */
  static async updateTimeSpent(id: string, timeSpent: number): Promise<void> {
    await dbManager.execute(
      `UPDATE read_history SET time_spent = ? WHERE id = ?`,
      [timeSpent, id]
    );
  }

  /**
   * 更新滚动位置
   */
  static async updateScrollPosition(id: string, scrollPosition: number): Promise<void> {
    await dbManager.execute(
      `UPDATE read_history SET scroll_position = ? WHERE id = ?`,
      [scrollPosition, id]
    );
  }

  /**
   * 清空阅读历史
   */
  static async clearHistory(): Promise<number> {
    const result = await dbManager.execute(
      `DELETE FROM read_history`
    );
    return result.changes;
  }

  /**
   * 删除指定日期前的历史
   */
  static async deleteOldHistory(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();
    const result = await dbManager.execute(
      `DELETE FROM read_history WHERE read_at < ?`,
      [cutoffDate]
    );
    return result.changes;
  }

  /**
   * 删除特定文章的历史记录
   */
  static async deleteArticleHistory(articleId: string): Promise<number> {
    const result = await dbManager.execute(
      `DELETE FROM read_history WHERE article_id = ?`,
      [articleId]
    );
    return result.changes;
  }

  /**
   * 获取阅读统计信息
   */
  static async getReadStatistics(): Promise<{
    totalReadings: number;
    totalTimeSpent: number;
    averageTimePerArticle: number;
    articlesRead: number;
  }> {
    const stats = await dbManager.queryOne<{
      count: number;
      total_time: number;
      articles_count: number;
    }>(
      `SELECT COUNT(*) as count, COALESCE(SUM(time_spent), 0) as total_time, COUNT(DISTINCT article_id) as articles_count FROM read_history`
    );

    return {
      totalReadings: stats?.count || 0,
      totalTimeSpent: stats?.total_time || 0,
      averageTimePerArticle:
        stats && stats.articles_count > 0
          ? Math.round((stats.total_time || 0) / stats.articles_count)
          : 0,
      articlesRead: stats?.articles_count || 0,
    };
  }

  /**
   * 获取最常阅读的文章
   */
  static async getMostReadArticles(limit: number = 10): Promise<
    Array<{
      article_id: string;
      article_title: string;
      read_count: number;
      total_time_spent: number;
    }>
  > {
    return await dbManager.query<{
      article_id: string;
      article_title: string;
      read_count: number;
      total_time_spent: number;
    }>(
      `SELECT article_id, article_title, COUNT(*) as read_count, SUM(time_spent) as total_time_spent
       FROM read_history
       GROUP BY article_id
       ORDER BY read_count DESC
       LIMIT ?`,
      [limit]
    );
  }

  /**
   * 获取特定时间范围内的阅读历史
   */
  static async getHistoryInDateRange(startDate: string, endDate: string): Promise<ReadHistory[]> {
    return await dbManager.query<ReadHistory>(
      `SELECT * FROM read_history WHERE read_at >= ? AND read_at <= ? ORDER BY read_at DESC`,
      [startDate, endDate]
    );
  }

  /**
   * 获取历史记录总数
   */
  static async getHistoryCount(): Promise<number> {
    const result = await dbManager.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM read_history`
    );
    return result?.count || 0;
  }

  /**
   * 获取每天的阅读统计
   */
  static async getDailyReadingStats(): Promise<
    Array<{
      date: string;
      reading_count: number;
      total_time: number;
    }>
  > {
    return await dbManager.query<{
      date: string;
      reading_count: number;
      total_time: number;
    }>(
      `SELECT DATE(read_at) as date, COUNT(*) as reading_count, SUM(time_spent) as total_time
       FROM read_history
       GROUP BY DATE(read_at)
       ORDER BY date DESC`
    );
  }
}
