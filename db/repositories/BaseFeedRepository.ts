/**
 * Feed 仓库实现
 */

import { IFeedRepository } from '../abstractions';
import { IFeed } from '../models';

export class BaseFeedRepository implements IFeedRepository {
  constructor(private db: any) { }

  async add(feed: IFeed): Promise<IFeed> {
    try {
      if (!this.db || !this.db.feeds) {
        throw new Error('Database not initialized');
      }
      await this.db.feeds.add(feed);
      return feed;
    } catch (error) {
      console.error('[BaseFeedRepository] Failed to add feed:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<IFeed>): Promise<IFeed> {
    try {
      if (!this.db || !this.db.feeds) {
        throw new Error('Database not initialized');
      }

      const existing = await this.db.feeds.get(id);
      if (!existing) {
        throw new Error(`Feed with id ${id} not found`);
      }

      const updated = { ...existing, ...data, id };
      await this.db.feeds.put(updated);
      return updated;
    } catch (error) {
      console.error('[BaseFeedRepository] Failed to update feed:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      if (!this.db || !this.db.feeds) {
        throw new Error('Database not initialized');
      }
      await this.db.feeds.delete(id);
      return true;
    } catch (error) {
      console.error('[BaseFeedRepository] Failed to delete feed:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<IFeed | null> {
    try {
      if (!this.db || !this.db.feeds) {
        return null;
      }
      const feed = await this.db.feeds.get(id);
      return feed || null;
    } catch (error) {
      console.error('[BaseFeedRepository] Failed to get feed by id:', error);
      throw error;
    }
  }

  async getAll(): Promise<IFeed[]> {
    try {
      if (!this.db || !this.db.feeds) {
        return [];
      }
      return await this.db.feeds.toArray();
    } catch (error) {
      console.error('[BaseFeedRepository] Failed to get all feeds:', error);
      return [];
    }
  }

  async getActive(): Promise<IFeed[]> {
    try {
      if (!this.db || !this.db.feeds) {
        return [];
      }
      const feeds = await this.db.feeds.toArray();
      return feeds.filter((feed: IFeed) => feed.isActive !== false);
    } catch (error) {
      console.error('[BaseFeedRepository] Failed to get active feeds:', error);
      return [];
    }
  }

  async getByCategory(categoryId: string): Promise<IFeed[]> {
    try {
      if (!this.db || !this.db.feeds) {
        return [];
      }
      const feeds = await this.db.feeds.toArray();
      return feeds.filter((feed: IFeed) =>
        feed.categoryIds?.includes(categoryId) || feed.categories?.some((c: any) => c.id === categoryId)
      );
    } catch (error) {
      console.error('[BaseFeedRepository] Failed to get feeds by category:', error);
      return [];
    }
  }

  async search(keyword: string): Promise<IFeed[]> {
    try {
      if (!this.db || !this.db.feeds) {
        return [];
      }
      const feeds = await this.db.feeds.toArray();
      const lowerKeyword = keyword.toLowerCase();
      return feeds.filter((feed: IFeed) =>
        feed.title.toLowerCase().includes(lowerKeyword) ||
        feed.description?.toLowerCase().includes(lowerKeyword) ||
        feed.url?.toLowerCase().includes(lowerKeyword)
      );
    } catch (error) {
      console.error('[BaseFeedRepository] Failed to search feeds:', error);
      return [];
    }
  }

  async getByUrl(url: string): Promise<IFeed | null> {
    try {
      if (!this.db || !this.db.feeds) {
        return null;
      }
      const feeds = await this.db.feeds.toArray();
      return feeds.find((feed: IFeed) => feed.url === url) || null;
    } catch (error) {
      console.error('[BaseFeedRepository] Failed to get feed by url:', error);
      return null;
    }
  }

  async addBatch(feeds: IFeed[]): Promise<IFeed[]> {
    try {
      if (!this.db || !this.db.feeds) {
        throw new Error('Database not initialized');
      }
      await this.db.feeds.bulkAdd(feeds);
      return feeds;
    } catch (error) {
      console.error('[BaseFeedRepository] Failed to add feeds in batch:', error);
      throw error;
    }
  }

  async updateBatch(
    updates: Array<{ id: string; data: Partial<IFeed> }>
  ): Promise<IFeed[]> {
    try {
      if (!this.db || !this.db.feeds) {
        throw new Error('Database not initialized');
      }

      const results: IFeed[] = [];
      for (const { id, data } of updates) {
        const updated = await this.update(id, data);
        results.push(updated);
      }
      return results;
    } catch (error) {
      console.error('[BaseFeedRepository] Failed to update feeds in batch:', error);
      throw error;
    }
  }

  async deleteBatch(ids: string[]): Promise<boolean> {
    try {
      if (!this.db || !this.db.feeds) {
        throw new Error('Database not initialized');
      }
      await this.db.feeds.bulkDelete(ids);
      return true;
    } catch (error) {
      console.error('[BaseFeedRepository] Failed to delete feeds in batch:', error);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      if (!this.db || !this.db.feeds) {
        return 0;
      }
      return await this.db.feeds.count();
    } catch (error) {
      console.error('[BaseFeedRepository] Failed to count feeds:', error);
      return 0;
    }
  }

  async countActive(): Promise<number> {
    try {
      if (!this.db || !this.db.feeds) {
        return 0;
      }
      const feeds = await this.db.feeds.toArray();
      return feeds.filter((feed: IFeed) => feed.isActive !== false).length;
    } catch (error) {
      console.error('[BaseFeedRepository] Failed to count active feeds:', error);
      return 0;
    }
  }
}
