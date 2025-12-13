/**
 * Dexie Item 仓库实现
 */

import { IItemRepository } from '../../../abstractions';
import { IItem, IPaginationParams, IPaginatedResult } from '../../../models';

export class DexieItemRepository implements IItemRepository {
  constructor(private db: any) { }

  async add(item: IItem): Promise<IItem> {
    try {
      if (!this.db || !this.db.items) {
        throw new Error('Database not initialized');
      }
      await this.db.items.add(item);
      return item;
    } catch (error) {
      console.error('[DexieItemRepository] Failed to add item:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<IItem>): Promise<IItem> {
    try {
      if (!this.db || !this.db.items) {
        throw new Error('Database not initialized');
      }

      const existing = await this.db.items.get(id);
      if (!existing) {
        throw new Error(`Item with id ${id} not found`);
      }

      const updated = { ...existing, ...data, id };
      await this.db.items.put(updated);
      return updated;
    } catch (error) {
      console.error('[DexieItemRepository] Failed to update item:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      if (!this.db || !this.db.items) {
        throw new Error('Database not initialized');
      }
      await this.db.items.delete(id);
      return true;
    } catch (error) {
      console.error('[DexieItemRepository] Failed to delete item:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<IItem | null> {
    try {
      if (!this.db || !this.db.items) {
        return null;
      }
      const item = await this.db.items.get(id);
      return item || null;
    } catch (error) {
      console.error('[DexieItemRepository] Failed to get item by id:', error);
      throw error;
    }
  }

  async getAll(): Promise<IItem[]> {
    try {
      if (!this.db || !this.db.items) {
        return [];
      }
      return await this.db.items.toArray();
    } catch (error) {
      console.error('[DexieItemRepository] Failed to get all items:', error);
      return [];
    }
  }

  async getAllPaginated(params: IPaginationParams): Promise<IPaginatedResult<IItem>> {
    try {
      if (!this.db || !this.db.items) {
        return { items: [], total: 0, page: params.page, pageSize: params.pageSize, totalPages: 0 };
      }

      const items = await this.db.items.toArray();
      const total = items.length;
      const totalPages = Math.ceil(total / params.pageSize);
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      const data = items.slice(start, end);

      return { items: data, total, page: params.page, pageSize: params.pageSize, totalPages };
    } catch (error) {
      console.error('[DexieItemRepository] Failed to get items paginated:', error);
      return { items: [], total: 0, page: params.page, pageSize: params.pageSize, totalPages: 0 };
    }
  }

  async getByFeedId(feedId: string): Promise<IItem[]> {
    try {
      if (!this.db || !this.db.items) {
        return [];
      }
      const items = await this.db.items.toArray();
      return items.filter((item: IItem) => item.feedId === feedId);
    } catch (error) {
      console.error('[DexieItemRepository] Failed to get items by feed id:', error);
      return [];
    }
  }

  async getByFeedIdPaginated(
    feedId: string,
    params: IPaginationParams
  ): Promise<IPaginatedResult<IItem>> {
    try {
      if (!this.db || !this.db.items) {
        return { items: [], total: 0, page: params.page, pageSize: params.pageSize, totalPages: 0 };
      }

      const items = await this.db.items.toArray();
      const filtered = items.filter((item: IItem) => item.feedId === feedId);
      const total = filtered.length;
      const totalPages = Math.ceil(total / params.pageSize);
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      const data = filtered.slice(start, end);

      return { items: data, total, page: params.page, pageSize: params.pageSize, totalPages };
    } catch (error) {
      console.error('[DexieItemRepository] Failed to get items by feed id paginated:', error);
      return { items: [], total: 0, page: params.page, pageSize: params.pageSize, totalPages: 0 };
    }
  }

  async getUnread(): Promise<IItem[]> {
    try {
      if (!this.db || !this.db.items) {
        return [];
      }
      const items = await this.db.items.toArray();
      return items.filter((item: IItem) => !item.isRead);
    } catch (error) {
      console.error('[DexieItemRepository] Failed to get unread items:', error);
      return [];
    }
  }

  async countUnread(): Promise<number> {
    try {
      if (!this.db || !this.db.items) {
        return 0;
      }
      const items = await this.db.items.toArray();
      return items.filter((item: IItem) => !item.isRead).length;
    } catch (error) {
      console.error('[DexieItemRepository] Failed to count unread items:', error);
      return 0;
    }
  }

  async getStarred(): Promise<IItem[]> {
    try {
      if (!this.db || !this.db.items) {
        return [];
      }
      const items = await this.db.items.toArray();
      return items.filter((item: IItem) => item.isStarred);
    } catch (error) {
      console.error('[DexieItemRepository] Failed to get starred items:', error);
      return [];
    }
  }

  async getByCategory(categoryId: string): Promise<IItem[]> {
    try {
      if (!this.db || !this.db.items) {
        return [];
      }
      const items = await this.db.items.toArray();
      return items.filter((item: IItem) =>
        item.categoryIds?.includes(categoryId) || item.categories?.some((c: any) => c.id === categoryId)
      );
    } catch (error) {
      console.error('[DexieItemRepository] Failed to get items by category:', error);
      return [];
    }
  }

  async getByTag(tagId: string): Promise<IItem[]> {
    try {
      if (!this.db || !this.db.items) {
        return [];
      }
      const items = await this.db.items.toArray();
      return items.filter((item: IItem) =>
        item.tagIds?.includes(tagId) || item.tags?.some((t: any) => t.id === tagId)
      );
    } catch (error) {
      console.error('[DexieItemRepository] Failed to get items by tag:', error);
      return [];
    }
  }

  async search(keyword: string): Promise<IItem[]> {
    try {
      if (!this.db || !this.db.items) {
        return [];
      }
      const items = await this.db.items.toArray();
      const lowerKeyword = keyword.toLowerCase();
      return items.filter((item: IItem) =>
        item.title.toLowerCase().includes(lowerKeyword) ||
        item.summary?.toLowerCase().includes(lowerKeyword) ||
        item.content?.toLowerCase().includes(lowerKeyword) ||
        item.author?.toLowerCase().includes(lowerKeyword)
      );
    } catch (error) {
      console.error('[DexieItemRepository] Failed to search items:', error);
      return [];
    }
  }

  async searchPaginated(
    keyword: string,
    params: IPaginationParams
  ): Promise<IPaginatedResult<IItem>> {
    try {
      const items = await this.search(keyword);
      const total = items.length;
      const totalPages = Math.ceil(total / params.pageSize);
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      const data = items.slice(start, end);

      return { items: data, total, page: params.page, pageSize: params.pageSize, totalPages };
    } catch (error) {
      console.error('[DexieItemRepository] Failed to search items paginated:', error);
      return { items: [], total: 0, page: params.page, pageSize: params.pageSize, totalPages: 0 };
    }
  }

  async getByLink(link: string): Promise<IItem | null> {
    try {
      if (!this.db || !this.db.items) {
        return null;
      }
      const items = await this.db.items.toArray();
      return items.find((item: IItem) => item.link === link) || null;
    } catch (error) {
      console.error('[DexieItemRepository] Failed to get item by link:', error);
      return null;
    }
  }

  async markAsRead(id: string): Promise<IItem> {
    try {
      return await this.update(id, { isRead: true });
    } catch (error) {
      console.error('[DexieItemRepository] Failed to mark item as read:', error);
      throw error;
    }
  }

  async markAsUnread(id: string): Promise<IItem> {
    try {
      return await this.update(id, { isRead: false });
    } catch (error) {
      console.error('[DexieItemRepository] Failed to mark item as unread:', error);
      throw error;
    }
  }

  async markAsReadBatch(ids: string[]): Promise<IItem[]> {
    try {
      const results: IItem[] = [];
      for (const id of ids) {
        const item = await this.markAsRead(id);
        results.push(item);
      }
      return results;
    } catch (error) {
      console.error('[DexieItemRepository] Failed to mark items as read in batch:', error);
      throw error;
    }
  }

  async markAsUnreadBatch(ids: string[]): Promise<IItem[]> {
    try {
      const results: IItem[] = [];
      for (const id of ids) {
        const item = await this.markAsUnread(id);
        results.push(item);
      }
      return results;
    } catch (error) {
      console.error('[DexieItemRepository] Failed to mark items as unread in batch:', error);
      throw error;
    }
  }

  async markAsStarred(id: string): Promise<IItem> {
    try {
      return await this.update(id, { isStarred: true });
    } catch (error) {
      console.error('[DexieItemRepository] Failed to mark item as starred:', error);
      throw error;
    }
  }

  async unmarkAsStarred(id: string): Promise<IItem> {
    try {
      return await this.update(id, { isStarred: false });
    } catch (error) {
      console.error('[DexieItemRepository] Failed to unmark item as starred:', error);
      throw error;
    }
  }

  async addBatch(items: IItem[]): Promise<IItem[]> {
    try {
      if (!this.db || !this.db.items) {
        throw new Error('Database not initialized');
      }
      await this.db.items.bulkAdd(items);
      return items;
    } catch (error) {
      console.error('[DexieItemRepository] Failed to add items in batch:', error);
      throw error;
    }
  }

  async updateBatch(
    updates: Array<{ id: string; data: Partial<IItem> }>
  ): Promise<IItem[]> {
    try {
      const results: IItem[] = [];
      for (const { id, data } of updates) {
        const item = await this.update(id, data);
        results.push(item);
      }
      return results;
    } catch (error) {
      console.error('[DexieItemRepository] Failed to update items in batch:', error);
      throw error;
    }
  }

  async deleteBatch(ids: string[]): Promise<boolean> {
    try {
      if (!this.db || !this.db.items) {
        throw new Error('Database not initialized');
      }
      await this.db.items.bulkDelete(ids);
      return true;
    } catch (error) {
      console.error('[DexieItemRepository] Failed to delete items in batch:', error);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      if (!this.db || !this.db.items) {
        return 0;
      }
      return await this.db.items.count();
    } catch (error) {
      console.error('[DexieItemRepository] Failed to count items:', error);
      return 0;
    }
  }

  async deleteByFeedId(feedId: string): Promise<boolean> {
    try {
      if (!this.db || !this.db.items) {
        throw new Error('Database not initialized');
      }
      const items = await this.getByFeedId(feedId);
      const ids = items.map((item: IItem) => item.id);
      if (ids.length > 0) {
        await this.deleteBatch(ids);
      }
      return true;
    } catch (error) {
      console.error('[DexieItemRepository] Failed to delete items by feed id:', error);
      throw error;
    }
  }
}
