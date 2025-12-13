import type { IHistoryRepository } from '@/db/abstractions/IHistoryRepository';
import type { IReadHistory } from '@/db/models';
import type { IDbAdapter } from '@/db/abstractions/IDbAdapter';
import BaseRepository from '@/db/abstractions/BaseRepository';

export class HistoryRepository implements IHistoryRepository {
  private base: BaseRepository<IReadHistory>;
  constructor(adapter: IDbAdapter<IReadHistory>) {
    this.base = new BaseRepository<IReadHistory>(adapter);
  }

  async add(history: IReadHistory): Promise<IReadHistory> {
    return this.base.create(history);
  }

  async update(id: string, data: Partial<IReadHistory>): Promise<IReadHistory> {
    return this.base.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.base.delete(id);
  }

  async getById(id: string): Promise<IReadHistory | null> {
    return this.base.getById(id);
  }

  async getAll(): Promise<IReadHistory[]> {
    return this.base.list({ orderBy: { field: 'readStartTime', direction: 'desc' } });
  }

  async getByItemId(itemId: string): Promise<IReadHistory[]> {
    return this.base.list({
      filter: h => h.itemId === itemId,
      orderBy: { field: 'readStartTime', direction: 'desc' },
    });
  }

  async getRecent(limit: number = 20): Promise<IReadHistory[]> {
    return this.base.list({
      orderBy: { field: 'readStartTime', direction: 'desc' },
      limit,
    });
  }

  async getByDateRange(startTime: number, endTime: number): Promise<IReadHistory[]> {
    return this.base.list({
      filter: h => h.readStartTime >= startTime && h.readStartTime <= endTime,
      orderBy: { field: 'readStartTime', direction: 'desc' },
    });
  }

  async search(keyword: string): Promise<IReadHistory[]> {
    return this.base.search(keyword, ['itemTitle', 'feedTitle']);
  }

  async addBatch(histories: IReadHistory[]): Promise<IReadHistory[]> {
    return this.base.createMany(histories);
  }

  async updateBatch(updates: Array<{ id: string; data: Partial<IReadHistory> }>): Promise<IReadHistory[]> {
    return this.base.updateMany(updates);
  }

  async deleteBatch(ids: string[]): Promise<boolean> {
    return this.base.deleteMany(ids);
  }

  async count(): Promise<number> {
    return this.base.count();
  }

  async clearOldHistory(beforeTime: number): Promise<boolean> {
    const oldHistories = await this.base.list({ filter: h => h.readStartTime < beforeTime });
    const ids = oldHistories.map(h => h.id!);
    return this.base.deleteMany(ids);
  }
}

export default HistoryRepository;
