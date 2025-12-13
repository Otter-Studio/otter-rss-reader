/**
 * Item 仓库接口
 */

import { IItem, IPaginationParams, IPaginatedResult } from '../models';

/**
 * Item 仓库接口 - 定义所有 Item 相关的数据库操作
 */
export interface IItemRepository {
  /**
   * 添加单个 Item
   */
  add(item: IItem): Promise<IItem>;

  /**
   * 更新单个 Item
   */
  update(id: string, data: Partial<IItem>): Promise<IItem>;

  /**
   * 删除单个 Item
   */
  delete(id: string): Promise<boolean>;

  /**
   * 按 ID 获取 Item
   */
  getById(id: string): Promise<IItem | null>;

  /**
   * 获取所有 Item
   */
  getAll(): Promise<IItem[]>;

  /**
   * 分页获取所有 Item
   */
  getAllPaginated(params: IPaginationParams): Promise<IPaginatedResult<IItem>>;

  /**
   * 按 Feed ID 获取 Item
   */
  getByFeedId(feedId: string): Promise<IItem[]>;

  /**
   * 按 Feed ID 分页获取 Item
   */
  getByFeedIdPaginated(
    feedId: string,
    params: IPaginationParams
  ): Promise<IPaginatedResult<IItem>>;

  /**
   * 获取所有未读 Item
   */
  getUnread(): Promise<IItem[]>;

  /**
   * 获取未读 Item 数量
   */
  countUnread(): Promise<number>;

  /**
   * 获取已星标 Item
   */
  getStarred(): Promise<IItem[]>;

  /**
   * 按分类获取 Item
   */
  getByCategory(categoryId: string): Promise<IItem[]>;

  /**
   * 按标签获取 Item
   */
  getByTag(tagId: string): Promise<IItem[]>;

  /**
   * 搜索 Item（标题、摘要、内容）
   */
  search(keyword: string): Promise<IItem[]>;

  /**
   * 搜索 Item（分页）
   */
  searchPaginated(
    keyword: string,
    params: IPaginationParams
  ): Promise<IPaginatedResult<IItem>>;

  /**
   * 按链接查找 Item
   */
  getByLink(link: string): Promise<IItem | null>;

  /**
   * 标记为已读
   */
  markAsRead(id: string): Promise<IItem>;

  /**
   * 标记为未读
   */
  markAsUnread(id: string): Promise<IItem>;

  /**
   * 批量标记为已读
   */
  markAsReadBatch(ids: string[]): Promise<IItem[]>;

  /**
   * 批量标记为未读
   */
  markAsUnreadBatch(ids: string[]): Promise<IItem[]>;

  /**
   * 标记为星标
   */
  markAsStarred(id: string): Promise<IItem>;

  /**
   * 取消星标
   */
  unmarkAsStarred(id: string): Promise<IItem>;

  /**
   * 批量添加 Item
   */
  addBatch(items: IItem[]): Promise<IItem[]>;

  /**
   * 批量更新 Item
   */
  updateBatch(
    updates: Array<{ id: string; data: Partial<IItem> }>
  ): Promise<IItem[]>;

  /**
   * 批量删除 Item
   */
  deleteBatch(ids: string[]): Promise<boolean>;

  /**
   * 获取 Item 总数
   */
  count(): Promise<number>;

  /**
   * 删除特定 Feed 下的所有 Item
   */
  deleteByFeedId(feedId: string): Promise<boolean>;
}
