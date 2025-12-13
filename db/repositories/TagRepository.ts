import type { ITagRepository } from '@/db/abstractions/ITagRepository';
import type { ITag } from '@/db/models';
import type { IDbAdapter } from '@/db/abstractions/IDbAdapter';
import BaseRepository from '@/db/abstractions/BaseRepository';

export class TagRepository implements ITagRepository {
  private base: BaseRepository<ITag>;
  constructor(adapter: IDbAdapter<ITag>) {
    this.base = new BaseRepository<ITag>(adapter);
  }

  async add(tag: ITag): Promise<ITag> {
    return this.base.create(tag);
  }

  async update(id: string, data: Partial<ITag>): Promise<ITag> {
    return this.base.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.base.delete(id);
  }

  async getById(id: string): Promise<ITag | null> {
    return this.base.getById(id);
  }

  async getAll(): Promise<ITag[]> {
    return this.base.list({ orderBy: { field: 'order' } });
  }

  async getActive(): Promise<ITag[]> {
    return this.base.list({ filter: t => t.isActive !== false, orderBy: { field: 'order' } });
  }

  async getSystemTags(): Promise<ITag[]> {
    return this.base.list({ filter: t => t.isSystem });
  }

  async search(keyword: string): Promise<ITag[]> {
    return this.base.search(keyword, ['name', 'description']);
  }

  async addBatch(tags: ITag[]): Promise<ITag[]> {
    return this.base.createMany(tags);
  }

  async updateBatch(updates: Array<{ id: string; data: Partial<ITag> }>): Promise<ITag[]> {
    return this.base.updateMany(updates);
  }

  async deleteBatch(ids: string[]): Promise<boolean> {
    return this.base.deleteMany(ids);
  }

  async count(): Promise<number> {
    return this.base.count();
  }
}

export default TagRepository;
