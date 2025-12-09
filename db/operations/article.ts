import { getRealm } from '../initialize';
import { RSSFeed, RSSArticle } from '../models';

/**
 * RSSArticle 操作
 */
export const ArticleOperations = {
  /**
   * 添加新的文章
   */
  addArticle(articleData: {
    id: string;
    title: string;
    link: string;
    feedId: string;
    description?: string;
    content?: string;
    author?: string;
    image?: string;
    pubDate?: Date;
    guid?: string;
    category?: string;
  }): RSSArticle | null {
    const realm = getRealm();
    const feed = realm.objectForPrimaryKey<RSSFeed>('RSSFeed', articleData.feedId);

    if (!feed) {
      console.warn(`Feed with id ${articleData.feedId} not found`);
      return null;
    }

    let newArticle: RSSArticle;

    realm.write(() => {
      newArticle = realm.create<RSSArticle>('RSSArticle', {
        ...articleData,
        feed,
        createdAt: new Date(),
      });
    });

    return newArticle!;
  },

  /**
   * 获取 Feed 的所有文章
   */
  getArticlesByFeed(feedId: string, limit?: number): RSSArticle[] {
    const realm = getRealm();
    let articles = realm
      .objects<RSSArticle>('RSSArticle')
      .filtered('feed.id == $0', feedId)
      .sorted('pubDate', true);

    if (limit) {
      return Array.from(articles).slice(0, limit);
    }

    return Array.from(articles);
  },

  /**
   * 获取所有未读文章
   */
  getUnreadArticles(limit?: number): RSSArticle[] {
    const realm = getRealm();
    let articles = realm
      .objects<RSSArticle>('RSSArticle')
      .filtered('isRead == false')
      .sorted('pubDate', true);

    if (limit) {
      return Array.from(articles).slice(0, limit);
    }

    return Array.from(articles);
  },

  /**
   * 获取已星标文章
   */
  getStarredArticles(limit?: number): RSSArticle[] {
    const realm = getRealm();
    let articles = realm
      .objects<RSSArticle>('RSSArticle')
      .filtered('isStarred == true')
      .sorted('pubDate', true);

    if (limit) {
      return Array.from(articles).slice(0, limit);
    }

    return Array.from(articles);
  },

  /**
   * 按 ID 获取文章
   */
  getArticleById(id: string): RSSArticle | undefined {
    const realm = getRealm();
    const article = realm.objectForPrimaryKey<RSSArticle>('RSSArticle', id);
    return article || undefined;
  },

  /**
   * 标记文章为已读
   */
  markAsRead(id: string): RSSArticle | undefined {
    const realm = getRealm();
    const article = realm.objectForPrimaryKey<RSSArticle>('RSSArticle', id);

    if (article) {
      realm.write(() => {
        article.isRead = true;
      });
      return article;
    }

    return undefined;
  },

  /**
   * 标记文章为未读
   */
  markAsUnread(id: string): RSSArticle | undefined {
    const realm = getRealm();
    const article = realm.objectForPrimaryKey<RSSArticle>('RSSArticle', id);

    if (article) {
      realm.write(() => {
        article.isRead = false;
      });
      return article;
    }

    return undefined;
  },

  /**
   * 切换文章星标状态
   */
  toggleStar(id: string): RSSArticle | undefined {
    const realm = getRealm();
    const article = realm.objectForPrimaryKey<RSSArticle>('RSSArticle', id);

    if (article) {
      realm.write(() => {
        article.isStarred = !article.isStarred;
      });
      return article;
    }

    return undefined;
  },

  /**
   * 标记 Feed 的所有文章为已读
   */
  markFeedArticlesAsRead(feedId: string): void {
    const realm = getRealm();
    const articles = realm
      .objects<RSSArticle>('RSSArticle')
      .filtered('feed.id == $0 AND isRead == false', feedId);

    realm.write(() => {
      articles.forEach((article) => {
        article.isRead = true;
      });
    });
  },

  /**
   * 删除文章
   */
  deleteArticle(id: string): void {
    const realm = getRealm();
    const article = realm.objectForPrimaryKey<RSSArticle>('RSSArticle', id);

    if (article) {
      realm.write(() => {
        realm.delete(article);
      });
    }
  },

  /**
   * 删除旧文章（根据日期）
   */
  deleteOldArticles(daysOld: number = 30): void {
    const realm = getRealm();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldArticles = realm
      .objects<RSSArticle>('RSSArticle')
      .filtered('pubDate < $0', cutoffDate);

    realm.write(() => {
      realm.delete(oldArticles);
    });
  },

  /**
   * 获取文章数量统计
   */
  getArticleStats(): {
    total: number;
    unread: number;
    starred: number;
  } {
    const realm = getRealm();
    return {
      total: realm.objects<RSSArticle>('RSSArticle').length,
      unread: realm.objects<RSSArticle>('RSSArticle').filtered('isRead == false').length,
      starred: realm.objects<RSSArticle>('RSSArticle').filtered('isStarred == true').length,
    };
  },
};
