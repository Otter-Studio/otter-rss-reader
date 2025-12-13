/**
 * 数据库适配器接口
 * 定义底层数据库需要实现的基本操作，用于抹平 Dexie 和 Drizzle 的差异
 */

export interface IDbAdapter<T> {
  /**
   * 插入单条记录
   */
  insert(data: T): Promise<T>;

  /**
   * 批量插入记录
   */
  insertMany(data: T[]): Promise<T[]>;

  /**
   * 根据 ID 查询单条记录
   */
  findById(id: string): Promise<T | null>;

  /**
   * 查询所有记录
   */
  findAll(): Promise<T[]>;

  /**
   * 根据条件查询记录
   */
  findWhere(predicate: (item: T) => boolean): Promise<T[]>;

  /**
   * 更新单条记录（需要先查询存在性）
   */
  updateById(id: string, data: Partial<T>): Promise<T>;

  /**
   * 批量更新记录
   */
  updateMany(updates: Array<{ id: string; data: Partial<T> }>): Promise<T[]>;

  /**
   * 删除单条记录
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * 批量删除记录
   */
  deleteMany(ids: string[]): Promise<boolean>;

  /**
   * 计数
   */
  count(predicate?: (item: T) => boolean): Promise<number>;

  /**
   * 搜索（模糊匹配）
   */
  search(keyword: string, fields: (keyof T)[]): Promise<T[]>;
}