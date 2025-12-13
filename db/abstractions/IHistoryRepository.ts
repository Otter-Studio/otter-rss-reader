/**
 * ReadHistory 仓库接口
 */

import { IReadHistory, IPaginationParams, IPaginatedResult } from '../models';

/**
 * ReadHistory 仓库接口 - 定义所有 ReadHistory 相关的数据库操作
 */
export interface IHistoryRepository {
  /**
   * 添加单个阅读历史
   */
  add(history: IReadHistory): Promise<IReadHistory>;

  /**
   * 更新单个阅读历史
   */
  update(id: string, data: Partial<IReadHistory>): Promise<IReadHistory>;

  /**
   * 删除单个阅读历史
   */
  delete(id: string): Promise<boolean>;

  /**
   * 按 ID 获取阅读历史
   */
  getById(id: string): Promise<IReadHistory | null>;

  /**
   * 获取所有阅读历史
   */
  getAll(): Promise<IReadHistory[]>;

  /**
   * 分页获取所有阅读历史
   */
  getAllPaginated(
    params: IPaginationParams
  ): Promise<IPaginatedResult<IReadHistory>>;

  /**
   * 按 Item ID 获取阅读历史
   */
  getByItemId(itemId: string): Promise<IReadHistory[]>;

  /**
   * 获取特定时间范围内的阅读历史
   */
  getByDateRange(startTime: number, endTime: number): Promise<IReadHistory[]>;

  /**
   * 获取最近的阅读历史
   */
  getRecent(limit?: number): Promise<IReadHistory[]>;

  /**
   * 按时间排序获取所有记录（新到旧）
   */
  getAllByReadTime(): Promise<IReadHistory[]>;

  /**
   * 批量添加阅读历史
   */
  addBatch(histories: IReadHistory[]): Promise<IReadHistory[]>;

  /**
   * 批量更新阅读历史
   */
  updateBatch(
    updates: Array<{ id: string; data: Partial<IReadHistory> }>
  ): Promise<IReadHistory[]>;

  /**
   * 批量删除阅读历史
   */
  deleteBatch(ids: string[]): Promise<boolean>;

  /**
   * 获取阅读历史总数
   */
  count(): Promise<number>;

  /**
   * 删除特定时间之前的阅读历史
   */
  deleteBeforeDate(timestamp: number): Promise<boolean>;

  /**
   * 清空所有阅读历史
   */
  clear(): Promise<boolean>;

  /**
   * 获取阅读统计（总时长、次数等）
   */
  getReadingStats(): Promise<{
    totalCount: number;
    totalTimeSpent: number;
    averageTimePerArticle: number;
    fullyReadCount: number;
  }>;
}
