/**
 * Tag 仓库接口
 */

import { ITag } from '../models';

/**
 * Tag 仓库接口 - 定义所有 Tag 相关的数据库操作
 */
export interface ITagRepository {
  /**
   * 添加单个 Tag
   */
  add(tag: ITag): Promise<ITag>;

  /**
   * 更新单个 Tag
   */
  update(id: string, data: Partial<ITag>): Promise<ITag>;

  /**
   * 删除单个 Tag
   */
  delete(id: string): Promise<boolean>;

  /**
   * 按 ID 获取 Tag
   */
  getById(id: string): Promise<ITag | null>;

  /**
   * 获取所有 Tag
   */
  getAll(): Promise<ITag[]>;

  /**
   * 获取所有活跃 Tag
   */
  getActive(): Promise<ITag[]>;

  /**
   * 获取所有系统 Tag
   */
  getSystemTags(): Promise<ITag[]>;

  /**
   * 按名称搜索 Tag
   */
  search(keyword: string): Promise<ITag[]>;

  /**
   * 按名称获取 Tag
   */
  getByName(name: string): Promise<ITag | null>;

  /**
   * 批量添加 Tag
   */
  addBatch(tags: ITag[]): Promise<ITag[]>;

  /**
   * 批量更新 Tag
   */
  updateBatch(
    updates: Array<{ id: string; data: Partial<ITag> }>
  ): Promise<ITag[]>;

  /**
   * 批量删除 Tag
   */
  deleteBatch(ids: string[]): Promise<boolean>;

  /**
   * 获取 Tag 总数
   */
  count(): Promise<number>;

  /**
   * 获取活跃 Tag 数量
   */
  countActive(): Promise<number>;
}
