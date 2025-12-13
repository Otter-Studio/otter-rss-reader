/**
 * Category 仓库实现
 */

import { ICategoryRepository } from '../abstractions';
import { ICategory } from '../models';

export class BaseCategoryRepository implements ICategoryRepository {
  constructor(private db: any) { }

  async add(category: ICategory): Promise<ICategory> {
    throw new Error('Not implemented');
  }

  async update(id: string, data: Partial<ICategory>): Promise<ICategory> {
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Not implemented');
  }

  async getById(id: string): Promise<ICategory | null> {
    throw new Error('Not implemented');
  }

  async getAll(): Promise<ICategory[]> {
    throw new Error('Not implemented');
  }

  async getActive(): Promise<ICategory[]> {
    throw new Error('Not implemented');
  }

  async search(keyword: string): Promise<ICategory[]> {
    throw new Error('Not implemented');
  }

  async getByName(name: string): Promise<ICategory | null> {
    throw new Error('Not implemented');
  }

  async getChildCategories(parentId: string): Promise<ICategory[]> {
    throw new Error('Not implemented');
  }

  async addBatch(categories: ICategory[]): Promise<ICategory[]> {
    throw new Error('Not implemented');
  }

  async updateBatch(
    updates: Array<{ id: string; data: Partial<ICategory> }>
  ): Promise<ICategory[]> {
    throw new Error('Not implemented');
  }

  async deleteBatch(ids: string[]): Promise<boolean> {
    throw new Error('Not implemented');
  }

  async count(): Promise<number> {
    throw new Error('Not implemented');
  }

  async countActive(): Promise<number> {
    throw new Error('Not implemented');
  }
}
