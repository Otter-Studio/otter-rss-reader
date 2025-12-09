import { getRealm } from '../initialize';
import { RSSFeed } from '../models';

/**
 * RSSFeed 操作
 */
export const FeedOperations = {
  /**
   * 添加新的 RSS Feed
   */
  addFeed(feedData: {
    id: string;
    title: string;
    url: string;
    description?: string;
    link?: string;
    image?: string;
    category?: string;
    author?: string;
    language?: string;
  }): RSSFeed {
    const realm = getRealm();
    let newFeed: RSSFeed;

    realm.write(() => {
      newFeed = realm.create<RSSFeed>('RSSFeed', {
        ...feedData,
        createdAt: new Date(),
      });
    });

    return newFeed!;
  },

  /**
   * 获取所有 Feed
   */
  getAllFeeds(): RSSFeed[] {
    const realm = getRealm();
    return Array.from(realm.objects<RSSFeed>('RSSFeed').sorted('createdAt', true));
  },

  /**
   * 获取活跃的 Feed
   */
  getActiveFeeds(): RSSFeed[] {
    const realm = getRealm();
    return Array.from(realm.objects<RSSFeed>('RSSFeed').filtered('isActive == true'));
  },

  /**
   * 按 ID 获取 Feed
   */
  getFeedById(id: string): RSSFeed | undefined {
    const realm = getRealm();
    const feed = realm.objectForPrimaryKey<RSSFeed>('RSSFeed', id);
    return feed || undefined;
  },

  /**
   * 更新 Feed
   */
  updateFeed(id: string, updates: Partial<Omit<RSSFeed, 'articles'>>): RSSFeed | undefined {
    const realm = getRealm();
    const feed = realm.objectForPrimaryKey<RSSFeed>('RSSFeed', id);

    if (feed) {
      realm.write(() => {
        Object.assign(feed, {
          ...updates,
          updatedAt: new Date(),
        });
      });
      return feed;
    }

    return undefined;
  },

  /**
   * 删除 Feed
   */
  deleteFeed(id: string): void {
    const realm = getRealm();
    const feed = realm.objectForPrimaryKey<RSSFeed>('RSSFeed', id);

    if (feed) {
      realm.write(() => {
        realm.delete(feed);
      });
    }
  },

  /**
   * 按类别获取 Feed
   */
  getFeedsByCategory(category: string): RSSFeed[] {
    const realm = getRealm();
    return Array.from(
      realm
        .objects<RSSFeed>('RSSFeed')
        .filtered('category == $0', category)
        .sorted('title')
    );
  },

  /**
   * 更新 Feed 的最后更新时间
   */
  updateLastUpdated(feedId: string): void {
    const realm = getRealm();
    const feed = realm.objectForPrimaryKey<RSSFeed>('RSSFeed', feedId);

    if (feed) {
      realm.write(() => {
        feed.lastUpdated = new Date();
      });
    }
  },
};
