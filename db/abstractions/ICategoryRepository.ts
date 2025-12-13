/**
 * Category 仓库接口
 */

import { ICategory } from '../models';

/**
 * Category 仓库接口 - 定义所有 Category 相关的数据库操作
 */
export interface ICategoryRepository {
  /**
   * 添加单个 Category
   */
  add(category: ICategory): Promise<ICategory>;

  /**
   * 更新单个 Category
   */
  update(id: string, data: Partial<ICategory>): Promise<ICategory>;

  /**
   * 删除单个 Category
   */
  delete(id: string): Promise<boolean>;

  /**
   * 按 ID 获取 Category
   */
  getById(id: string): Promise<ICategory | null>;

  /**
   * 获取所有 Category
   */
  getAll(): Promise<ICategory[]>;

  /**
   * 获取所有活跃 Category
   */
  getActive(): Promise<ICategory[]>;

  /**
   * 按名称搜索 Category
   */
  search(keyword: string): Promise<ICategory[]>;

  /**
   * 按名称获取 Category
   */
  getByName(name: string): Promise<ICategory | null>;

  /**
   * 获取子分类
   */
  getChildCategories(parentId: string): Promise<ICategory[]>;

  /**
   * 批量添加 Category
   */
  addBatch(categories: ICategory[]): Promise<ICategory[]>;

  /**
   * 批量更新 Category
   */
  updateBatch(
    updates: Array<{ id: string; data: Partial<ICategory> }>
  ): Promise<ICategory[]>;

  /**
   * 批量删除 Category
   */
  deleteBatch(ids: string[]): Promise<boolean>;

  /**
   * 获取 Category 总数
   */
  count(): Promise<number>;

  /**
   * 获取活跃 Category 数量
   */
  countActive(): Promise<number>;
}
