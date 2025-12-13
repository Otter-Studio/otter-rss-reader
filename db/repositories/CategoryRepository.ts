import type { ICategoryRepository } from '@/db/abstractions/ICategoryRepository';
import type { ICategory } from '@/db/models';
import type { IDbAdapter } from '@/db/abstractions/IDbAdapter';
import BaseRepository from '@/db/abstractions/BaseRepository';

export class CategoryRepository implements ICategoryRepository {
  private base: BaseRepository<ICategory>;
  constructor(adapter: IDbAdapter<ICategory>) {
    this.base = new BaseRepository<ICategory>(adapter);
  }

  async add(category: ICategory): Promise<ICategory> {
    return this.base.create(category);
  }

  async update(id: string, data: Partial<ICategory>): Promise<ICategory> {
    return this.base.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.base.delete(id);
  }

  async getById(id: string): Promise<ICategory | null> {
    return this.base.getById(id);
  }

  async getAll(): Promise<ICategory[]> {
    return this.base.list({ orderBy: { field: 'order' } });
  }

  async getActive(): Promise<ICategory[]> {
    return this.base.list({ filter: c => c.isActive !== false, orderBy: { field: 'order' } });
  }

  async search(keyword: string): Promise<ICategory[]> {
    return this.base.search(keyword, ['name', 'description']);
  }

  async addBatch(categories: ICategory[]): Promise<ICategory[]> {
    return this.base.createMany(categories);
  }

  async updateBatch(updates: Array<{ id: string; data: Partial<ICategory> }>): Promise<ICategory[]> {
    return this.base.updateMany(updates);
  }

  async deleteBatch(ids: string[]): Promise<boolean> {
    return this.base.deleteMany(ids);
  }

  async count(): Promise<number> {
    return this.base.count();
  }
}

export default CategoryRepository;
