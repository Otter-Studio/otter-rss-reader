import { getRealm } from '../initialize';
import { ReadHistory } from '../models';

/**
 * ReadHistory 操作
 */
export const HistoryOperations = {
  /**
   * 添加阅读历史记录
   */
  addHistory(articleId: string, articleTitle: string, timeSpent: number = 0): ReadHistory {
    const realm = getRealm();
    let history: ReadHistory;

    realm.write(() => {
      history = realm.create<ReadHistory>('ReadHistory', {
        id: `${articleId}-${Date.now()}`,
        articleId,
        articleTitle,
        timeSpent,
        readAt: new Date(),
      });
    });

    return history!;
  },

  /**
   * 获取阅读历史
   */
  getHistory(limit: number = 50): ReadHistory[] {
    const realm = getRealm();
    return Array.from(realm.objects<ReadHistory>('ReadHistory').sorted('readAt', true)).slice(0, limit);
  },

  /**
   * 获取特定文章的阅读历史
   */
  getArticleHistory(articleId: string): ReadHistory[] {
    const realm = getRealm();
    return Array.from(
      realm
        .objects<ReadHistory>('ReadHistory')
        .filtered('articleId == $0', articleId)
        .sorted('readAt', true)
    );
  },

  /**
   * 清空阅读历史
   */
  clearHistory(): void {
    const realm = getRealm();
    const allHistory = realm.objects<ReadHistory>('ReadHistory');

    realm.write(() => {
      realm.delete(allHistory);
    });
  },

  /**
   * 删除指定日期前的历史
   */
  deleteOldHistory(daysOld: number = 90): void {
    const realm = getRealm();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldHistory = realm.objects<ReadHistory>('ReadHistory').filtered('readAt < $0', cutoffDate);

    realm.write(() => {
      realm.delete(oldHistory);
    });
  },
};
