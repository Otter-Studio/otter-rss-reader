import Realm from 'realm';

/**
 * RSS Feed 模型
 */
export class RSSFeed extends Realm.Object<RSSFeed> {
  static schema: Realm.ObjectSchema = {
    name: 'RSSFeed',
    primaryKey: 'id',
    properties: {
      id: 'string',
      title: 'string',
      description: 'string?',
      url: 'string',
      link: 'string?',
      image: 'string?', // 源的图标/图片 URL
      category: 'string?',
      author: 'string?',
      language: 'string?',
      lastUpdated: 'date?',
      createdAt: { type: 'date', default: () => new Date() },
      isActive: { type: 'bool', default: true },
      articles: 'RSSArticle[]', // 一对多关系
    },
  };

  id!: string;
  title!: string;
  description?: string;
  url!: string;
  link?: string;
  image?: string;
  category?: string;
  author?: string;
  language?: string;
  lastUpdated?: Date;
  createdAt!: Date;
  isActive!: boolean;
  articles!: Realm.List<any>;
}
