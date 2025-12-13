/**
 * Feed Operations - 便利层
 * 
 * 提供一个简化的 API 来访问 Feed 相关的数据库操作
 */

import { getDatabase } from './container';
import { IFeed } from './models';

/**
 * Feed 操作对象
 * 
 * 提供访问 Feed 数据的便利方法
 */
export const FeedOperations = {
  /**
   * 获取所有活跃的 Feed
   */
  async getActiveFeeds(): Promise<IFeed[]> {
    try {
      const database = await getDatabase();
      const feeds = await database.feeds.getActive();
      return feeds;
    } catch (error) {
      console.error('[FeedOperations] Failed to get active feeds:', error);
      return [];
    }
  },

  /**
   * 根据 ID 获取 Feed
   */
  async getFeedById(feedId: string): Promise<IFeed | null> {
    try {
      const database = await getDatabase();
      const feed = await database.feeds.getById(feedId);
      return feed;
    } catch (error) {
      console.error('[FeedOperations] Failed to get feed by id:', error);
      return null;
    }
  },

  /**
   * 添加新的 Feed
   */
  async addFeed(feedData: Partial<IFeed>): Promise<IFeed> {
    try {
      const database = await getDatabase();
      const now = new Date();
      const feed = await database.feeds.add({
        ...feedData,
        id:
          (feedData.id && feedData.id.trim()) ||
          (feedData.url && feedData.url.trim()) ||
          `feed-${Date.now()}`,
        title: feedData.title?.trim() || 'Untitled',
        description: feedData.description || '',
        url: feedData.url?.trim() || '',
        language: feedData.language || 'en',
        isActive: feedData.isActive ?? true,
        createdAt: feedData.createdAt || now,
        updatedAt: feedData.updatedAt || now,
      } as IFeed);
      console.log('[FeedOperations] Feed added:', feed);
      return feed;
    } catch (error) {
      console.error('[FeedOperations] Failed to add feed:', error);
      throw error;
    }
  },

  /**
   * 更新 Feed
   */
  async updateFeed(feedId: string, feedData: Partial<IFeed>): Promise<IFeed> {
    try {
      const database = await getDatabase();
      const updated = await database.feeds.update(feedId, {
        ...feedData,
        updatedAt: new Date(),
      });
      console.log('[FeedOperations] Feed updated:', feedId);
      return updated;
    } catch (error) {
      console.error('[FeedOperations] Failed to update feed:', error);
      throw error;
    }
  },

  /**
   * 删除 Feed
   */
  async deleteFeed(feedId: string): Promise<void> {
    try {
      const database = await getDatabase();
      await database.feeds.delete(feedId);
      console.log('[FeedOperations] Feed deleted:', feedId);
    } catch (error) {
      console.error('[FeedOperations] Failed to delete feed:', error);
      throw error;
    }
  },

  /**
   * 获取所有 Feed
   */
  async getAllFeeds(): Promise<IFeed[]> {
    try {
      const database = await getDatabase();
      const feeds = await database.feeds.getAll();
      return feeds;
    } catch (error) {
      console.error('[FeedOperations] Failed to get all feeds:', error);
      return [];
    }
  },

  /**
   * 搜索 Feed
   */
  async searchFeeds(query: string): Promise<IFeed[]> {
    try {
      const database = await getDatabase();
      const feeds = await database.feeds.search(query);
      return feeds;
    } catch (error) {
      console.error('[FeedOperations] Failed to search feeds:', error);
      return [];
    }
  },
};
