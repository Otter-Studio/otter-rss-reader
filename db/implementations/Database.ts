import { Platform } from 'react-native';
import Dexie from 'dexie';
import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import type { IDatabase } from '@/db/abstractions/IDatabase';
import type { ISettingsRepository } from '@/db/abstractions/ISettingsRepository';
import type { IFeedRepository } from '@/db/abstractions/IFeedRepository';
import type { IItemRepository } from '@/db/abstractions/IItemRepository';
import type { ICategoryRepository } from '@/db/abstractions/ICategoryRepository';
import type { ITagRepository } from '@/db/abstractions/ITagRepository';
import type { IHistoryRepository } from '@/db/abstractions/IHistoryRepository';
import type { ISettings, IItem, ICategory, ITag, IReadHistory } from '@/db/models';
import BaseRepository from '@/db/abstractions/BaseRepository';
import DexieAdapter from '@/db/implementations/adapters/DexieAdapter';
import ExpoSQLiteAdapter from '@/db/implementations/adapters/ExpoSqliteAdapter';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import SettingsRepository from '@/db/repositories/SettingsRepository';
import FeedRepository from '@/db/repositories/FeedRepository';
import ItemRepository from '@/db/repositories/ItemRepository';
import CategoryRepository from '@/db/repositories/CategoryRepository';
import TagRepository from '@/db/repositories/TagRepository';
import HistoryRepository from '@/db/repositories/HistoryRepository';

// ================= Web (Dexie) core =================
class DexieDbCore extends Dexie {
  settings!: Dexie.Table<ISettings, string>;
  feeds!: Dexie.Table<any, string>;
  items!: Dexie.Table<IItem, string>;
  categories!: Dexie.Table<ICategory, string>;
  tags!: Dexie.Table<ITag, string>;
  history!: Dexie.Table<IReadHistory, string>;
  constructor() {
    super('otter_rss_db');
    this.version(4).stores({
      settings: 'id, baseUrl, username, password, theme, refreshInterval, articlesPerPage, language, autoMarkAsRead, autoMarkAsReadDelay, notificationsEnabled, soundNotificationEnabled, vibrationEnabled, offlineModeEnabled, cacheItemLimit, compressionEnabled, readingModeEnabled, feedsGroupedViewEnabled, lastSyncTime, fontSizeMultiplier, lineHeightMultiplier, backgroundColor, textColor, createdAt, updatedAt',
      feeds: 'id, title, description, url, htmlUrl, iconUrl, author, language, lastUpdated, lastError, failureCount, isActive, customTitle, itemCount, unreadCount, categoryIds, createdAt, updatedAt',
      items: 'id, title, summary, content, author, link, htmlUrl, image, published, crawlTime, feedId, feedTitle, categoryIds, tagIds, isRead, isStarred, isArchived, readingTime, rating, notes, scrollPosition, createdAt, updatedAt',
      categories: 'id, name, description, iconUrl, color, order, parentId, isActive, createdAt, updatedAt',
      tags: 'id, name, description, color, iconUrl, order, isSystem, isActive, createdAt, updatedAt',
      history: 'id, itemId, itemTitle, feedTitle, itemLink, readStartTime, readEndTime, timeSpent, scrollPosition, fullyRead, rating, notes, deviceType, viewportTime, createdAt, updatedAt',
    });
    this.settings = this.table('settings');
    this.feeds = this.table('feeds');
    this.items = this.table('items');
    this.categories = this.table('categories');
    this.tags = this.table('tags');
    this.history = this.table('history');
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
  feedsGroupedViewEnabled: integer('feedsGroupedViewEnabled'),
  lastSyncTime: integer('lastSyncTime'),
  fontSizeMultiplier: real('fontSizeMultiplier'),
  lineHeightMultiplier: real('lineHeightMultiplier'),
  backgroundColor: text('backgroundColor'),
  textColor: text('textColor'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});

const feedsTable = sqliteTable('feeds', {
  id: text('id').primaryKey(),
  title: text('title'),
  description: text('description'),
  url: text('url'),
  htmlUrl: text('htmlUrl'),
  iconUrl: text('iconUrl'),
  author: text('author'),
  language: text('language'),
  lastUpdated: integer('lastUpdated'),
  lastError: text('lastError'),
  failureCount: integer('failureCount'),
  isActive: integer('isActive'),
  customTitle: text('customTitle'),
  itemCount: integer('itemCount'),
  unreadCount: integer('unreadCount'),
  categoryIds: text('categoryIds'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});

const itemsTable = sqliteTable('items', {
  id: text('id').primaryKey(),
  title: text('title'),
  summary: text('summary'),
  content: text('content'),
  author: text('author'),
  link: text('link'),
  htmlUrl: text('htmlUrl'),
  image: text('image'),
  published: integer('published'),
  crawlTime: integer('crawlTime'),
  feedId: text('feedId'),
  feedTitle: text('feedTitle'),
  categoryIds: text('categoryIds'),
  tagIds: text('tagIds'),
  isRead: integer('isRead'),
  isStarred: integer('isStarred'),
  isArchived: integer('isArchived'),
  readingTime: integer('readingTime'),
  rating: integer('rating'),
  notes: text('notes'),
  scrollPosition: integer('scrollPosition'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});

const categoriesTable = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  iconUrl: text('iconUrl'),
  color: text('color'),
  order: integer('order'),
  parentId: text('parentId'),
  isActive: integer('isActive'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});

const tagsTable = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  color: text('color'),
  iconUrl: text('iconUrl'),
  order: integer('order'),
  isSystem: integer('isSystem'),
  isActive: integer('isActive'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});

const historyTable = sqliteTable('history', {
  id: text('id').primaryKey(),
  itemId: text('itemId'),
  itemTitle: text('itemTitle'),
  feedTitle: text('feedTitle'),
  itemLink: text('itemLink'),
  readStartTime: integer('readStartTime'),
  readEndTime: integer('readEndTime'),
  timeSpent: integer('timeSpent'),
  scrollPosition: integer('scrollPosition'),
  fullyRead: integer('fullyRead'),
  rating: integer('rating'),
  notes: text('notes'),
  deviceType: text('deviceType'),
  viewportTime: integer('viewportTime'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});


export default class Database implements IDatabase {
  private dexieCore: DexieDbCore | null = null;
  private sqliteDb: SQLiteDatabase | null = null;

  public settings!: ISettingsRepository;
  public feeds!: IFeedRepository;
  public items!: IItemRepository;
  public categories!: ICategoryRepository;
  public tags!: ITagRepository;
  public history!: IHistoryRepository;

  async initialize(): Promise<void> {
    const isWeb = Platform.OS === 'web';
    if (isWeb) {
      if (!this.dexieCore) {
        this.dexieCore = new DexieDbCore();
        // settings
        const settingsAdapter = new DexieAdapter<ISettings>(this.dexieCore, 'settings');
        this.settings = new SettingsRepository(settingsAdapter);
        // feeds
        const feedsAdapter = new DexieAdapter<any>(this.dexieCore, 'feeds');
        this.feeds = new FeedRepository(feedsAdapter);
        // items
        const itemsAdapter = new DexieAdapter<IItem>(this.dexieCore, 'items');
        this.items = new ItemRepository(itemsAdapter);
        // categories
        const categoriesAdapter = new DexieAdapter<ICategory>(this.dexieCore, 'categories');
        this.categories = new CategoryRepository(categoriesAdapter);
        // tags
        const tagsAdapter = new DexieAdapter<ITag>(this.dexieCore, 'tags');
        this.tags = new TagRepository(tagsAdapter);
        // history
        const historyAdapter = new DexieAdapter<IReadHistory>(this.dexieCore, 'history');
        this.history = new HistoryRepository(historyAdapter);
      }
    } else {
      if (!this.sqliteDb) {
        this.sqliteDb = openDatabaseSync('otter_rss_db');
        // --- 自动建表 ---
        const db = drizzle(this.sqliteDb);
        // 只需执行一次即可，若表已存在不会报错
        await db.run(`CREATE TABLE IF NOT EXISTS settings (
          id TEXT PRIMARY KEY,
          baseUrl TEXT,
          username TEXT,
          password TEXT,
          theme TEXT,
          refreshInterval INTEGER,
          articlesPerPage INTEGER,
          language TEXT,
          autoMarkAsRead INTEGER,
          autoMarkAsReadDelay INTEGER,
          notificationsEnabled INTEGER,
          soundNotificationEnabled INTEGER,
          vibrationEnabled INTEGER,
          offlineModeEnabled INTEGER,
          cacheItemLimit INTEGER,
          compressionEnabled INTEGER,
          readingModeEnabled INTEGER,
          feedsGroupedViewEnabled INTEGER,
          lastSyncTime INTEGER,
          fontSizeMultiplier REAL,
          lineHeightMultiplier REAL,
          backgroundColor TEXT,
          textColor TEXT,
          createdAt TEXT,
          updatedAt TEXT
        );`);
        await db.run(`CREATE TABLE IF NOT EXISTS feeds (
          id TEXT PRIMARY KEY,
          title TEXT,
          description TEXT,
          url TEXT,
          htmlUrl TEXT,
          iconUrl TEXT,
          author TEXT,
          language TEXT,
          lastUpdated INTEGER,
          lastError TEXT,
          failureCount INTEGER,
          isActive INTEGER,
          customTitle TEXT,
          itemCount INTEGER,
          unreadCount INTEGER,
          categoryIds TEXT,
          createdAt TEXT,
          updatedAt TEXT
        );`);
        await db.run(`CREATE TABLE IF NOT EXISTS items (
          id TEXT PRIMARY KEY,
          title TEXT,
          summary TEXT,
          content TEXT,
          author TEXT,
          link TEXT,
          htmlUrl TEXT,
          image TEXT,
          published INTEGER,
          crawlTime INTEGER,
          feedId TEXT,
          feedTitle TEXT,
          categoryIds TEXT,
          tagIds TEXT,
          isRead INTEGER,
          isStarred INTEGER,
          isArchived INTEGER,
          readingTime INTEGER,
          rating INTEGER,
          notes TEXT,
          scrollPosition INTEGER,
          createdAt TEXT,
          updatedAt TEXT
        );`);
        await db.run(`CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT,
          description TEXT,
          iconUrl TEXT,
          color TEXT,
          \`order\` INTEGER,
          parentId TEXT,
          isActive INTEGER,
          createdAt TEXT,
          updatedAt TEXT
        );`);
        await db.run(`CREATE TABLE IF NOT EXISTS tags (
          id TEXT PRIMARY KEY,
          name TEXT,
          description TEXT,
          color TEXT,
          iconUrl TEXT,
          \`order\` INTEGER,
          isSystem INTEGER,
          isActive INTEGER,
          createdAt TEXT,
          updatedAt TEXT
        );`);
        await db.run(`CREATE TABLE IF NOT EXISTS history (
          id TEXT PRIMARY KEY,
          itemId TEXT,
          itemTitle TEXT,
          feedTitle TEXT,
          itemLink TEXT,
          readStartTime INTEGER,
          readEndTime INTEGER,
          timeSpent INTEGER,
          scrollPosition INTEGER,
          fullyRead INTEGER,
          rating INTEGER,
          notes TEXT,
          deviceType TEXT,
          viewportTime INTEGER,
          createdAt TEXT,
          updatedAt TEXT
        );`);
        // --- end ---
        // settings
        const settingsAdapter = new ExpoSQLiteAdapter<ISettings>(this.sqliteDb, settingsTable, 'id');
        this.settings = new SettingsRepository(settingsAdapter);
        // feeds
        const feedsAdapter = new ExpoSQLiteAdapter<any>(this.sqliteDb, feedsTable, 'id');
        this.feeds = new FeedRepository(feedsAdapter);
        // items
        const itemsAdapter = new ExpoSQLiteAdapter<IItem>(this.sqliteDb, itemsTable, 'id');
        this.items = new ItemRepository(itemsAdapter);
        // categories
        const categoriesAdapter = new ExpoSQLiteAdapter<ICategory>(this.sqliteDb, categoriesTable, 'id');
        this.categories = new CategoryRepository(categoriesAdapter);
        // tags
        const tagsAdapter = new ExpoSQLiteAdapter<ITag>(this.sqliteDb, tagsTable, 'id');
        this.tags = new TagRepository(tagsAdapter);
        // history
        const historyAdapter = new ExpoSQLiteAdapter<IReadHistory>(this.sqliteDb, historyTable, 'id');
        this.history = new HistoryRepository(historyAdapter);
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
}