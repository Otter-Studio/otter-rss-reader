/**
 * Feed 仓库接口
 */

import { IFeed } from '../models';

/**
 * Feed 仓库接口 - 定义所有 Feed 相关的数据库操作
 */
export interface IFeedRepository {
  /**
   * 添加单个 Feed
   */
  add(feed: IFeed): Promise<IFeed>;

  /**
   * 更新单个 Feed
   */
  update(id: string, data: Partial<IFeed>): Promise<IFeed>;

  /**
   * 删除单个 Feed
   */
  delete(id: string): Promise<boolean>;

  /**
   * 按 ID 获取 Feed
   */
  getById(id: string): Promise<IFeed | null>;

  /**
   * 获取所有 Feed
   */
  getAll(): Promise<IFeed[]>;

  /**
   * 获取所有活跃 Feed
   */
  getActive(): Promise<IFeed[]>;

  /**
   * 按分类获取 Feed
   */
  getByCategory(categoryId: string): Promise<IFeed[]>;

  /**
   * 搜索 Feed
   */
  search(keyword: string): Promise<IFeed[]>;

  /**
   * 按 URL 查找 Feed
   */
  getByUrl(url: string): Promise<IFeed | null>;

  /**
   * 批量添加 Feed
   */
  addBatch(feeds: IFeed[]): Promise<IFeed[]>;

  /**
   * 批量更新 Feed
   */
  updateBatch(
    updates: Array<{ id: string; data: Partial<IFeed> }>
  ): Promise<IFeed[]>;

  /**
   * 批量删除 Feed
   */
  deleteBatch(ids: string[]): Promise<boolean>;

  /**
   * 获取 Feed 总数
   */
  count(): Promise<number>;

  /**
   * 获取活跃 Feed 数量
   */
  countActive(): Promise<number>;
}
