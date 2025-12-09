import Realm from 'realm';

/**
 * 用户设置模型
 */
export class UserSettings extends Realm.Object<UserSettings> {
  static schema: Realm.ObjectSchema = {
    name: 'UserSettings',
    primaryKey: 'id',
    properties: {
      id: 'string',
      theme: { type: 'string', default: 'light' }, // 'light' | 'dark' | 'system'
      refreshInterval: { type: 'int', default: 3600 }, // 秒为单位
      articlesPerPage: { type: 'int', default: 20 },
      language: { type: 'string', default: 'en' },
      autoMarkAsRead: { type: 'bool', default: false },
      notificationsEnabled: { type: 'bool', default: true },
      lastSyncTime: 'date?',
      createdAt: { type: 'date', default: () => new Date() },
      updatedAt: { type: 'date', default: () => new Date() },
    },
  };

  id!: string;
  theme!: string;
  refreshInterval!: number;
  articlesPerPage!: number;
  language!: string;
  autoMarkAsRead!: boolean;
  notificationsEnabled!: boolean;
  lastSyncTime?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
