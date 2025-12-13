import type { IItemRepository } from '@/db/abstractions/IItemRepository';
import type { IItem, IPaginationParams, IPaginatedResult } from '@/db/models';
import type { IDbAdapter } from '@/db/abstractions/IDbAdapter';
import BaseRepository from '@/db/abstractions/BaseRepository';

export class ItemRepository implements IItemRepository {
  private base: BaseRepository<IItem>;
  constructor(adapter: IDbAdapter<IItem>) {
    this.base = new BaseRepository<IItem>(adapter);
  }

  async add(item: IItem): Promise<IItem> {
    return this.base.create(item);
  }
  async update(id: string, data: Partial<IItem>): Promise<IItem> {
    return this.base.update(id, data);
  }
  async delete(id: string): Promise<boolean> {
    return this.base.delete(id);
  }
  async getById(id: string): Promise<IItem | null> {
    return this.base.getById(id);
  }
  async getAll(): Promise<IItem[]> {
    return this.base.list();
  }

  async getAllPaginated(params: IPaginationParams): Promise<IPaginatedResult<IItem>> {
    const { page = 1, pageSize = 20 } = params;
    const offset = (page - 1) * pageSize;
    const items = await this.base.list({ offset, limit: pageSize });
    const total = await this.base.count();
    return { items, total, page, pageSize };
  }

  async getByFeedId(feedId: string): Promise<IItem[]> {
    return this.base.list({ filter: item => item.feedId === feedId });
  }

  async getByFeedIdPaginated(feedId: string, params: IPaginationParams): Promise<IPaginatedResult<IItem>> {
    const { page = 1, pageSize = 20 } = params;
    const offset = (page - 1) * pageSize;
    const items = await this.base.list({
      filter: item => item.feedId === feedId,
      offset,
      limit: pageSize,
    });
    const total = await this.base.count(item => item.feedId === feedId);
    return { items, total, page, pageSize };
  }

  async getUnread(): Promise<IItem[]> {
    return this.base.list({ filter: item => !item.isRead });
  }

  async getUnreadCount(): Promise<number> {
    return this.base.count(item => !item.isRead);
  }

  async getStarred(): Promise<IItem[]> {
    return this.base.list({ filter: item => item.isStarred });
  }

  async getByCategory(categoryId: string): Promise<IItem[]> {
    return this.base.list({ filter: item => item.categoryIds?.includes(categoryId) });
  }

  async getByTag(tagId: string): Promise<IItem[]> {
    return this.base.list({ filter: item => item.tagIds?.includes(tagId) });
  }

  async search(keyword: string): Promise<IItem[]> {
    return this.base.search(keyword, ['title', 'summary', 'content']);
  }

  async getRecent(limit: number = 20): Promise<IItem[]> {
    return this.base.list({
      orderBy: { field: 'published', direction: 'desc' },
      limit,
    });
  }

  async addBatch(items: IItem[]): Promise<IItem[]> {
    return this.base.createMany(items);
  }

  async updateBatch(updates: Array<{ id: string; data: Partial<IItem> }>): Promise<IItem[]> {
    return this.base.updateMany(updates);
  }

  async deleteBatch(ids: string[]): Promise<boolean> {
    return this.base.deleteMany(ids);
  }

  async count(): Promise<number> {
    return this.base.count();
  }

  async markAsRead(id: string): Promise<IItem> {
    return this.update(id, { isRead: true });
  }

  async markAsUnread(id: string): Promise<IItem> {
    return this.update(id, { isRead: false });
  }

  async markAsStarred(id: string): Promise<IItem> {
    return this.update(id, { isStarred: true });
  }

  async markAsUnstarred(id: string): Promise<IItem> {
    return this.update(id, { isStarred: false });
  }

  async markAsArchived(id: string): Promise<IItem> {
    return this.update(id, { isArchived: true });
  }

  async markAsUnarchived(id: string): Promise<IItem> {
    return this.update(id, { isArchived: false });
  }
}

export default ItemRepository;
