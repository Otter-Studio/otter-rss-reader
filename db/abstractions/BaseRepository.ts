import type { IDbAdapter } from "@/db/abstractions/IDbAdapter";

export type OrderDirection = "asc" | "desc";

export type ListOptions<T> = {
  filter?: (item: T) => boolean;
  limit?: number;
  offset?: number;
  orderBy?: { field: keyof T; direction?: OrderDirection };
};

export default class BaseRepository<T extends { id?: string }> {
  protected adapter: IDbAdapter<T>;

  constructor(adapter: IDbAdapter<T>) {
    this.adapter = adapter;
  }

  async create(data: T): Promise<T> {
    return this.adapter.insert(data);
  }

  async createMany(list: T[]): Promise<T[]> {
    return this.adapter.insertMany(list);
  }

  async getById(id: string): Promise<T | null> {
    return this.adapter.findById(id);
  }

  async list(options: ListOptions<T> = {}): Promise<T[]> {
    const { filter, limit, offset, orderBy } = options;
    let items = filter
      ? await this.adapter.findWhere(filter)
      : await this.adapter.findAll();

    if (orderBy) {
      const { field, direction = "asc" } = orderBy;
      items = items.sort((a: T, b: T) => {
        const av = a[field];
        const bv = b[field];
        if (av === bv) return 0;
        const cmp = av! < bv! ? -1 : 1;
        return direction === "asc" ? cmp : -cmp;
      });
    }

    const start = offset ?? 0;
    const end = limit != null ? start + limit : undefined;
    return items.slice(start, end);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.adapter.updateById(id, data);
  }

  async updateMany(updates: { id: string; data: Partial<T> }[]): Promise<T[]> {
    return this.adapter.updateMany(updates);
  }

  async delete(id: string): Promise<boolean> {
    return this.adapter.deleteById(id);
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    return this.adapter.deleteMany(ids);
  }

  async exists(id: string): Promise<boolean> {
    const item = await this.adapter.findById(id);
    return !!item;
  }

  async count(predicate?: (item: T) => boolean): Promise<number> {
    return this.adapter.count(predicate);
  }

  async search(keyword: string, fields: (keyof T)[]): Promise<T[]> {
    return this.adapter.search(keyword, fields);
  }
}

