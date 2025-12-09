import Realm from 'realm';

/**
 * RSS 文章模型
 */
export class RSSArticle extends Realm.Object<RSSArticle> {
  static schema: Realm.ObjectSchema = {
    name: 'RSSArticle',
    primaryKey: 'id',
    properties: {
      id: 'string',
      title: 'string',
      description: 'string?',
      content: 'string?',
      author: 'string?',
      link: 'string',
      image: 'string?',
      pubDate: 'date?',
      createdAt: { type: 'date', default: () => new Date() },
      isRead: { type: 'bool', default: false },
      isStarred: { type: 'bool', default: false },
      feed: 'RSSFeed', // 关联的 Feed
      category: 'string?',
      guid: 'string?', // 文章的全局唯一标识
    },
  };

  id!: string;
  title!: string;
  description?: string;
  content?: string;
  author?: string;
  link!: string;
  image?: string;
  pubDate?: Date;
  createdAt!: Date;
  isRead!: boolean;
  isStarred!: boolean;
  feed!: Realm.Object & { id: string }; // 关联的 Feed
  category?: string;
  guid?: string;
}
