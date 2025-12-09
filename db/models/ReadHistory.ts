import Realm from 'realm';

/**
 * 阅读历史模型
 */
export class ReadHistory extends Realm.Object<ReadHistory> {
  static schema: Realm.ObjectSchema = {
    name: 'ReadHistory',
    primaryKey: 'id',
    properties: {
      id: 'string',
      articleId: 'string',
      articleTitle: 'string',
      readAt: { type: 'date', default: () => new Date() },
      timeSpent: { type: 'int', default: 0 }, // 秒为单位
      scrollPosition: { type: 'float', default: 0 },
    },
  };

  id!: string;
  articleId!: string;
  articleTitle!: string;
  readAt!: Date;
  timeSpent!: number;
  scrollPosition!: number;
}
