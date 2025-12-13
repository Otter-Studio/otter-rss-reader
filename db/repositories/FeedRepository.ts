import type { IFeedRepository } from '@/db/abstractions/IFeedRepository';
import type { IFeed } from '@/db/models';
import type { IDbAdapter } from '@/db/abstractions/IDbAdapter';
import BaseRepository from '@/db/abstractions/BaseRepository';

export class FeedRepository implements IFeedRepository {
  private base: BaseRepository<IFeed>;
  constructor(adapter: IDbAdapter<IFeed>) {
    this.base = new BaseRepository<IFeed>(adapter);
  }

  async add(feed: IFeed): Promise<IFeed> {
    return this.base.create(feed);
  }
  async update(id: string, data: Partial<IFeed>): Promise<IFeed> {
    return this.base.update(id, data);
  }
  async delete(id: string): Promise<boolean> {
    return this.base.delete(id);
  }
  async getById(id: string): Promise<IFeed | null> {
    return this.base.getById(id);
  }
  async getAll(): Promise<IFeed[]> {
    return this.base.list();
  }
  async getActive(): Promise<IFeed[]> {
    return this.base.list({ filter: f => f.isActive !== false });
  }
  async getByCategory(categoryId: string): Promise<IFeed[]> {
    return this.base.list({ filter: f => f.categoryIds?.includes(categoryId) });
  }
  async search(keyword: string): Promise<IFeed[]> {
    return this.base.search(keyword, ['title', 'url', 'description']);
  }
  async getByUrl(url: string): Promise<IFeed | null> {
    const all = await this.base.list({ filter: f => f.url === url });
    return all[0] || null;
  }
  async addBatch(feeds: IFeed[]): Promise<IFeed[]> {
    return this.base.createMany(feeds);
  }
  async updateBatch(updates: Array<{ id: string; data: Partial<IFeed> }>): Promise<IFeed[]> {
    return this.base.updateMany(updates);
  }
  async deleteBatch(ids: string[]): Promise<boolean> {
    return this.base.deleteMany(ids);
  }
  async count(): Promise<number> {
    return this.base.count();
  }
  async countActive(): Promise<number> {
    return this.base.count(f => f.isActive !== false);
  }
}

export default FeedRepository;
