import { Platform } from 'react-native';
import Dexie from 'dexie';
import { openDatabase, SQLiteDatabase } from 'expo-sqlite';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import type { IDatabase } from '@/db/abstractions/IDatabase';
import type { ISettingsRepository } from '@/db/abstractions/ISettingsRepository';
import type { ISettings } from '@/db/models';
import BaseRepository from '@/db/abstractions/BaseRepository';
import DexieAdapter from '@/db/implementations/adapters/DexieAdapter';
import ExpoSQLiteAdapter from '@/db/implementations/adapters/ExpoSqliteAdapter';
import SettingsRepository from '@/db/repositories/SettingsRepository';

// ================= Web (Dexie) core =================
class DexieDbCore extends Dexie {
  settings!: Dexie.Table<ISettings, string>;
  constructor() {
    super('otter_rss_db');
    this.version(1).stores({
      settings: 'id, baseUrl, username, password, theme, updatedAt',
    });
    this.settings = this.table('settings');
  }
}

// ================= Mobile (Expo SQLite + Drizzle) table =================
const settingsTable = sqliteTable('settings', {
  id: text('id').primaryKey(),
  baseUrl: text('baseUrl'),
  username: text('username'),
  password: text('password'),
  theme: text('theme'),
  refreshInterval: integer('refreshInterval'),
  articlesPerPage: integer('articlesPerPage'),
  language: text('language'),
  autoMarkAsRead: integer('autoMarkAsRead'),
  autoMarkAsReadDelay: integer('autoMarkAsReadDelay'),
  notificationsEnabled: integer('notificationsEnabled'),
  soundNotificationEnabled: integer('soundNotificationEnabled'),
  vibrationEnabled: integer('vibrationEnabled'),
  offlineModeEnabled: integer('offlineModeEnabled'),
  cacheItemLimit: integer('cacheItemLimit'),
  compressionEnabled: integer('compressionEnabled'),
  readingModeEnabled: integer('readingModeEnabled'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});


export default class Database implements IDatabase {
  private dexieCore: DexieDbCore | null = null;
  private sqliteDb: SQLiteDatabase | null = null;

  public settings!: ISettingsRepository;

  async initialize(): Promise<void> {
    const isWeb = Platform.OS === 'web';
    if (isWeb) {
      if (!this.dexieCore) {
        this.dexieCore = new DexieDbCore();
        const adapter = new DexieAdapter<ISettings>(this.dexieCore, 'settings');
        this.settings = new SettingsRepository(adapter);
      }
    } else {
      if (!this.sqliteDb) {
        this.sqliteDb = openDatabase('otter_rss_db');
        const adapter = new ExpoSQLiteAdapter<ISettings>(this.sqliteDb, settingsTable, 'id');
        this.settings = new SettingsRepository(adapter);
      }
    }
  }

  async close(): Promise<void> {
    // Dexie 可关闭
    if (this.dexieCore) {
      this.dexieCore.close();
      this.dexieCore = null;
    }
    // Expo SQLite 无显式 close，这里置空引用
    this.sqliteDb = null;
  }

  isInitialized(): boolean {
    return !!(this.dexieCore || this.sqliteDb);
  }

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      if (this.dexieCore) await this.dexieCore.settings.clear();
    } else {
      await this.settings.reset();
    }
  }

  // 其余仓库暂未统一，后续逐步迁移
  get feeds(): any { throw new Error('Not implemented'); }
  get items(): any { throw new Error('Not implemented'); }
  get categories(): any { throw new Error('Not implemented'); }
  get tags(): any { throw new Error('Not implemented'); }
  get history(): any { throw new Error('Not implemented'); }
}