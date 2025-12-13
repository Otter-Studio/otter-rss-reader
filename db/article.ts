/**
 * Article Operations - 便利层
 * 
 * 提供一个简化的 API 来访问 Article（Item）相关的数据库操作
 */

import { getDatabase } from './container';
import { IItem } from './models';

/**
 * Article 操作对象
 * 
 * 提供访问 Article 数据的便利方法
 */
export const ArticleOperations = {
  /**
   * 根据 Feed ID 获取文章
   */
  async getArticlesByFeed(feedId: string): Promise<IItem[]> {
    try {
      const database = await getDatabase();
      const articles = await database.items.getByFeedId(feedId);
      return articles;
    } catch (error) {
      console.error('[ArticleOperations] Failed to get articles by feed:', error);
      return [];
    }
  },

  /**
   * 获取最近的文章
   */
  async getRecentArticles(limit: number = 100): Promise<IItem[]> {
    try {
      const database = await getDatabase();
      const articles = await database.items.getAll();
      // 按发布日期排序，获取最新的文章
      return articles
        .sort((a, b) => (b.published || 0) - (a.published || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('[ArticleOperations] Failed to get recent articles:', error);
      return [];
    }
  },

  /**
   * 批量添加文章
   */
  async addArticlesInBatch(articles: Partial<IItem>[]): Promise<IItem[]> {
    try {
      const database = await getDatabase();
      const items = articles.map((article, index) => {
        const now = new Date();
        const fallbackId = (article.feedId || 'item') + '-' + Date.now() + '-' + index;
        return {
          ...article,
          id:
            (article.id && article.id.trim()) ||
            (article.link && article.link.trim()) ||
            fallbackId,
          title: article.title?.trim() || 'Untitled',
          summary: article.summary || '',
          content: article.content || '',
          feedId: article.feedId?.toString().trim() || 'unknown',
          link: article.link?.trim() || '',
          published: article.published || Date.now(),
          isRead: article.isRead ?? false,
          isStarred: article.isStarred ?? false,
          isArchived: article.isArchived ?? false,
          createdAt: article.createdAt || now,
          updatedAt: article.updatedAt || now,
        } as IItem;
      });

      const result = await database.items.addBatch(items);
      console.log('[ArticleOperations] Added articles in batch:', result.length);
      return result;
    } catch (error) {
      console.error('[ArticleOperations] Failed to add articles in batch:', error);
      throw error;
    }
  },

  /**
   * 根据 ID 获取文章
   */
  async getArticleById(articleId: string): Promise<IItem | null> {
    try {
      const database = await getDatabase();
      const article = await database.items.getById(articleId);
      return article;
    } catch (error) {
      console.error('[ArticleOperations] Failed to get article by id:', error);
      return null;
    }
  },

  /**
   * 标记文章为已读
   */
  async markAsRead(articleId: string): Promise<IItem> {
    try {
      const database = await getDatabase();
      const article = await database.items.markAsRead(articleId);
      console.log('[ArticleOperations] Article marked as read:', articleId);
      return article;
    } catch (error) {
      console.error('[ArticleOperations] Failed to mark article as read:', error);
      throw error;
    }
  },

  /**
   * 标记文章为未读
   */
  async markAsUnread(articleId: string): Promise<IItem> {
    try {
      const database = await getDatabase();
      const article = await database.items.markAsUnread(articleId);
      console.log('[ArticleOperations] Article marked as unread:', articleId);
      return article;
    } catch (error) {
      console.error('[ArticleOperations] Failed to mark article as unread:', error);
      throw error;
    }
  },

  /**
   * 标记文章为星标
   */
  async markAsStarred(articleId: string): Promise<IItem> {
    try {
      const database = await getDatabase();
      const article = await database.items.markAsStarred(articleId);
      console.log('[ArticleOperations] Article marked as starred:', articleId);
      return article;
    } catch (error) {
      console.error('[ArticleOperations] Failed to mark article as starred:', error);
      throw error;
    }
  },

  /**
   * 取消星标
   */
  async unmarkAsStarred(articleId: string): Promise<IItem> {
    try {
      const database = await getDatabase();
      const article = await database.items.unmarkAsStarred(articleId);
      console.log('[ArticleOperations] Article unmarked as starred:', articleId);
      return article;
    } catch (error) {
      console.error('[ArticleOperations] Failed to unmark article as starred:', error);
      throw error;
    }
  },

  /**
   * 搜索文章
   */
  async searchArticles(keyword: string): Promise<IItem[]> {
    try {
      const database = await getDatabase();
      const articles = await database.items.search(keyword);
      return articles;
    } catch (error) {
      console.error('[ArticleOperations] Failed to search articles:', error);
      return [];
    }
  },

  /**
   * 获取所有未读文章
   */
  async getUnreadArticles(): Promise<IItem[]> {
    try {
      const database = await getDatabase();
      const articles = await database.items.getUnread();
      return articles;
    } catch (error) {
      console.error('[ArticleOperations] Failed to get unread articles:', error);
      return [];
    }
  },

  /**
   * 获取已星标文章
   */
  async getStarredArticles(): Promise<IItem[]> {
    try {
      const database = await getDatabase();
      const articles = await database.items.getStarred();
      return articles;
    } catch (error) {
      console.error('[ArticleOperations] Failed to get starred articles:', error);
      return [];
    }
  },

  /**
   * 更新文章
   */
  async updateArticle(articleId: string, data: Partial<IItem>): Promise<IItem> {
    try {
      const database = await getDatabase();
      const updated = await database.items.update(articleId, {
        ...data,
        updatedAt: new Date(),
      });
      console.log('[ArticleOperations] Article updated:', articleId);
      return updated;
    } catch (error) {
      console.error('[ArticleOperations] Failed to update article:', error);
      throw error;
    }
  },

  /**
   * 删除文章
   */
  async deleteArticle(articleId: string): Promise<void> {
    try {
      const database = await getDatabase();
      await database.items.delete(articleId);
      console.log('[ArticleOperations] Article deleted:', articleId);
    } catch (error) {
      console.error('[ArticleOperations] Failed to delete article:', error);
      throw error;
    }
  },

  /**
   * 批量标记为已读
   */
  async markAsReadBatch(articleIds: string[]): Promise<IItem[]> {
    try {
      const database = await getDatabase();
      const articles = await database.items.markAsReadBatch(articleIds);
      console.log('[ArticleOperations] Marked articles as read:', articleIds.length);
      return articles;
    } catch (error) {
      console.error('[ArticleOperations] Failed to mark articles as read in batch:', error);
      throw error;
    }
  },

  /**
   * 批量标记为未读
   */
  async markAsUnreadBatch(articleIds: string[]): Promise<IItem[]> {
    try {
      const database = await getDatabase();
      const articles = await database.items.markAsUnreadBatch(articleIds);
      console.log('[ArticleOperations] Marked articles as unread:', articleIds.length);
      return articles;
    } catch (error) {
      console.error('[ArticleOperations] Failed to mark articles as unread in batch:', error);
      throw error;
    }
  },

  /**
   * 获取未读文章数量
   */
  async getUnreadCount(): Promise<number> {
    try {
      const database = await getDatabase();
      const count = await database.items.countUnread();
      return count;
    } catch (error) {
      console.error('[ArticleOperations] Failed to get unread count:', error);
      return 0;
    }
  },
};
