import { IDbAdapter } from "@/db/abstractions/IDbAdapter";
import Dexie, { Table, UpdateSpec } from 'dexie';

export default class DexieAdapter<T extends { id?: string }> implements IDbAdapter<T> {
  private table: Table<T, string>;

  constructor(db: Dexie, tableName: string) {
    this.table = db.table(tableName);
  }

  async insert(data: T): Promise<T> {
    const id = await this.table.add(data);
    return { ...data, id: id as string };
  }

  async insertMany(data: T[]): Promise<T[]> {
    await this.table.bulkAdd(data);
    return data;
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.table.get(id);
    return result || null;
  }

  async findAll(): Promise<T[]> {
    return await this.table.toArray();
  }

  async findWhere(predicate: (item: T) => boolean): Promise<T[]> {
    const all = await this.table.toArray();
    return all.filter(predicate);
  }

  async updateById(id: string, data: Partial<T>): Promise<T> {
    await this.table.update(id, data as UpdateSpec<T>);
    const updated = await this.table.get(id);
    if (!updated) throw new Error(`Item with id ${id} not found`);
    return updated;
  }

  async updateMany(updates: { id: string; data: Partial<T> }[]): Promise<T[]> {
    await Promise.all(
      updates.map(({ id, data }) => this.table.update(id, data as UpdateSpec<T>))
    );
    const ids = updates.map(u => u.id);
    return await this.table.bulkGet(ids).then(results =>
      results.filter((r): r is T => r !== undefined)
    );
  }

  async deleteById(id: string): Promise<boolean> {
    await this.table.delete(id);
    return true;
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    await this.table.bulkDelete(ids);
    return true;
  }

  async count(predicate?: (item: T) => boolean): Promise<number> {
    if (predicate) {
      const all = await this.table.toArray();
      return all.filter(predicate).length;
    }
    return await this.table.count();
  }

  async search(keyword: string, fields: (keyof T)[]): Promise<T[]> {
    const all = await this.table.toArray();
    const lowerKeyword = keyword.toLowerCase();
    return all.filter(item =>
      fields.some(field => {
        const value = item[field];
        return value != null && String(value).toLowerCase().includes(lowerKeyword);
      })
    );
  }
}