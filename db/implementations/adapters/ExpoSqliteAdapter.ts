import { IDbAdapter } from "@/db/abstractions/IDbAdapter";
import { drizzle, ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";
import { eq, inArray, sql, and, or, like } from "drizzle-orm";
import { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";

/**
 * Expo SQLite + Drizzle ORM 适配器
 * 
 * 使用 Drizzle ORM 为 Expo SQLite 提供数据库操作的适配层
 */
export default class ExpoSQLiteAdapter<T extends Record<string, any>> implements IDbAdapter<T> {
  private db: ExpoSQLiteDatabase<Record<string, never>>;
  private table: SQLiteTableWithColumns<any>;
  private idField: string;

  /**
   * 构造函数
   * 
   * @param sqliteDb - Expo SQLite 数据库实例
   * @param table - Drizzle 表定义
   * @param idField - ID 字段名称，默认为 'id'
   */
  constructor(
    sqliteDb: SQLiteDatabase,
    table: SQLiteTableWithColumns<any>,
    idField: string = 'id'
  ) {
    this.db = drizzle(sqliteDb);
    this.table = table;
    this.idField = idField;
  }

  /**
   * 插入单条记录
   */
  async insert(data: T): Promise<T> {
    try {
      const result = await this.db.insert(this.table).values(data as any).returning();
      return result[0] as T;
    } catch (error) {
      console.error('[ExpoSQLiteAdapter] Insert error:', error);
      throw error;
    }
  }

  /**
   * 批量插入记录
   */
  async insertMany(data: T[]): Promise<T[]> {
    try {
      if (data.length === 0) return [];
      const result = await this.db.insert(this.table).values(data as any[]).returning();
      return result as T[];
    } catch (error) {
      console.error('[ExpoSQLiteAdapter] InsertMany error:', error);
      throw error;
    }
  }

  /**
   * 根据 ID 查询单条记录
   */
  async findById(id: string): Promise<T | null> {
    try {
      const result = await this.db
        .select()
        .from(this.table)
        .where(eq(this.table[this.idField], id))
        .limit(1);

      return result.length > 0 ? (result[0] as T) : null;
    } catch (error) {
      console.error('[ExpoSQLiteAdapter] FindById error:', error);
      throw error;
    }
  }

  /**
   * 查询所有记录
   */
  async findAll(): Promise<T[]> {
    try {
      const result = await this.db.select().from(this.table);
      return result as T[];
    } catch (error) {
      console.error('[ExpoSQLiteAdapter] FindAll error:', error);
      throw error;
    }
  }

  /**
   * 根据条件查询记录（在内存中过滤）
   * 
   * 注意：此方法会先取出所有记录再在内存中过滤，对于大数据集不够高效
   * 建议使用 Drizzle 的查询构建器进行更高效的过滤
   */
  async findWhere(predicate: (item: T) => boolean): Promise<T[]> {
    try {
      const allRecords = await this.findAll();
      return allRecords.filter(predicate);
    } catch (error) {
      console.error('[ExpoSQLiteAdapter] FindWhere error:', error);
      throw error;
    }
  }

  /**
   * 更新单条记录（需要先查询存在性）
   */
  async updateById(id: string, data: Partial<T>): Promise<T> {
    try {
      // 先检查记录是否存在
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error(`Record with id ${id} not found`);
      }

      // 执行更新
      const result = await this.db
        .update(this.table)
        .set(data as any)
        .where(eq(this.table[this.idField], id))
        .returning();

      if (result.length === 0) {
        throw new Error(`Failed to update record with id ${id}`);
      }

      return result[0] as T;
    } catch (error) {
      console.error('[ExpoSQLiteAdapter] UpdateById error:', error);
      throw error;
    }
  }

  /**
   * 批量更新记录
   */
  async updateMany(updates: Array<{ id: string; data: Partial<T> }>): Promise<T[]> {
    try {
      const results: T[] = [];

      // SQLite 不直接支持批量更新不同的值，需要逐个更新
      // 可以考虑使用事务来提高性能
      for (const update of updates) {
        const result = await this.updateById(update.id, update.data);
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error('[ExpoSQLiteAdapter] UpdateMany error:', error);
      throw error;
    }
  }

  /**
   * 删除单条记录
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .delete(this.table)
        .where(eq(this.table[this.idField], id))
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error('[ExpoSQLiteAdapter] DeleteById error:', error);
      throw error;
    }
  }

  /**
   * 批量删除记录
   */
  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      if (ids.length === 0) return true;

      const result = await this.db
        .delete(this.table)
        .where(inArray(this.table[this.idField], ids))
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error('[ExpoSQLiteAdapter] DeleteMany error:', error);
      throw error;
    }
  }

  /**
   * 计数
   */
  async count(predicate?: (item: T) => boolean): Promise<number> {
    try {
      if (predicate) {
        // 如果有条件，先获取所有记录再过滤计数
        const filtered = await this.findWhere(predicate);
        return filtered.length;
      }

      // 无条件时直接使用 SQL COUNT
      const result = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(this.table);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('[ExpoSQLiteAdapter] Count error:', error);
      throw error;
    }
  }

  /**
   * 搜索（模糊匹配）
   * 
   * 使用 LIKE 操作符在指定字段中搜索关键词
   */
  async search(keyword: string, fields: (keyof T)[]): Promise<T[]> {
    try {
      if (fields.length === 0) return [];

      // 构建 OR 条件：field1 LIKE %keyword% OR field2 LIKE %keyword% ...
      const conditions = fields.map(field =>
        like(this.table[field as string], `%${keyword}%`)
      );

      const result = await this.db
        .select()
        .from(this.table)
        .where(or(...conditions));

      return result as T[];
    } catch (error) {
      console.error('[ExpoSQLiteAdapter] Search error:', error);
      throw error;
    }
  }

  /**
   * 获取原始 Drizzle 数据库实例
   * 用于执行更复杂的自定义查询
   */
  getDb(): ExpoSQLiteDatabase<Record<string, never>> {
    return this.db;
  }

  /**
   * 获取表定义
   */
  getTable(): SQLiteTableWithColumns<any> {
    return this.table;
  }
}