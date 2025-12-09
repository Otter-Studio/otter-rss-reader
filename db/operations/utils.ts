import { getRealm } from '../initialize';
import { RSSFeed, RSSArticle, UserSettings, ReadHistory } from '../models';

/**
 * 数据库工具函数
 */
export const DatabaseUtils = {
  /**
   * 清空所有数据
   */
  clearAllData(): void {
    const realm = getRealm();

    realm.write(() => {
      realm.deleteAll();
    });

    console.log('All data cleared');
  },

  /**
   * 获取数据库统计信息
   */
  getStatistics(): {
    feeds: number;
    articles: number;
    unreadArticles: number;
    starredArticles: number;
    historyEntries: number;
  } {
    const realm = getRealm();

    return {
      feeds: realm.objects<RSSFeed>('RSSFeed').length,
      articles: realm.objects<RSSArticle>('RSSArticle').length,
      unreadArticles: realm.objects<RSSArticle>('RSSArticle').filtered('isRead == false').length,
      starredArticles: realm.objects<RSSArticle>('RSSArticle').filtered('isStarred == true').length,
      historyEntries: realm.objects<ReadHistory>('ReadHistory').length,
    };
  },

  /**
   * 导出数据为 JSON
   */
  exportData(): object {
    const realm = getRealm();

    return {
      feeds: Array.from(realm.objects<RSSFeed>('RSSFeed')),
      articles: Array.from(realm.objects<RSSArticle>('RSSArticle')),
      settings: Array.from(realm.objects<UserSettings>('UserSettings')),
      history: Array.from(realm.objects<ReadHistory>('ReadHistory')),
    };
  },

  /**
   * 获取数据库文件路径
   */
  getRealmPath(): string {
    const realm = getRealm();
    return realm.path;
  },
};
