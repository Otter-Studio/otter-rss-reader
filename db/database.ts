import * as SQLite from 'expo-sqlite';

/**
 * SQLite 数据库管理器
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() { }

  /**
   * 获取数据库管理器单例
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * 初始化数据库并创建所有表
   */
  public async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('otter-rss-reader.db');
      console.log('Database initialized successfully');
      await this.createTables();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * 获取数据库实例
   */
  public getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * 创建所有数据库表
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // 创建 RSS Feed 表
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS rss_feeds (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          url TEXT NOT NULL UNIQUE,
          link TEXT,
          image TEXT,
          category TEXT,
          author TEXT,
          language TEXT,
          last_updated DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active INTEGER DEFAULT 1
        );
      `);

      // 创建 RSS 文章表
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS rss_articles (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          content TEXT,
          author TEXT,
          link TEXT NOT NULL,
          image TEXT,
          pub_date DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_read INTEGER DEFAULT 0,
          is_starred INTEGER DEFAULT 0,
          feed_id TEXT NOT NULL,
          category TEXT,
          guid TEXT,
          FOREIGN KEY (feed_id) REFERENCES rss_feeds(id) ON DELETE CASCADE
        );
      `);

      // 创建用户设置表
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id TEXT PRIMARY KEY,
          theme TEXT DEFAULT 'light',
          refresh_interval INTEGER DEFAULT 3600,
          articles_per_page INTEGER DEFAULT 20,
          language TEXT DEFAULT 'en',
          auto_mark_as_read INTEGER DEFAULT 0,
          notifications_enabled INTEGER DEFAULT 1,
          last_sync_time DATETIME,
          base_url TEXT,
          username TEXT,
          password TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 创建阅读历史表
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS read_history (
          id TEXT PRIMARY KEY,
          article_id TEXT NOT NULL,
          article_title TEXT NOT NULL,
          read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          time_spent INTEGER DEFAULT 0,
          scroll_position REAL DEFAULT 0
        );
      `);

      // 创建索引以提高查询性能
      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_articles_feed_id ON rss_articles(feed_id);
        CREATE INDEX IF NOT EXISTS idx_articles_is_read ON rss_articles(is_read);
        CREATE INDEX IF NOT EXISTS idx_articles_is_starred ON rss_articles(is_starred);
        CREATE INDEX IF NOT EXISTS idx_articles_pub_date ON rss_articles(pub_date);
        CREATE INDEX IF NOT EXISTS idx_feeds_is_active ON rss_feeds(is_active);
        CREATE INDEX IF NOT EXISTS idx_feeds_category ON rss_feeds(category);
        CREATE INDEX IF NOT EXISTS idx_history_article_id ON read_history(article_id);
        CREATE INDEX IF NOT EXISTS idx_history_read_at ON read_history(read_at);
      `);

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Failed to create database tables:', error);
      throw error;
    }
  }

  /**
   * 关闭数据库连接
   */
  public async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log('Database closed');
    }
  }

  /**
   * 执行 SQL 查询
   */
  public async query<T>(
    sql: string,
    params?: any[]
  ): Promise<T[]> {
    const db = this.getDatabase();
    try {
      const result = await db.getAllAsync<T>(sql, params || []);
      return result;
    } catch (error) {
      console.error('Query error:', error, 'SQL:', sql);
      throw error;
    }
  }

  /**
   * 执行 SQL 查询返回单条记录
   */
  public async queryOne<T>(
    sql: string,
    params?: any[]
  ): Promise<T | null> {
    const db = this.getDatabase();
    try {
      const result = await db.getFirstAsync<T>(sql, params || []);
      return result || null;
    } catch (error) {
      console.error('Query error:', error, 'SQL:', sql);
      throw error;
    }
  }

  /**
   * 执行 SQL 插入/更新/删除
   */
  public async execute(
    sql: string,
    params?: any[]
  ): Promise<SQLite.SQLiteRunResult> {
    const db = this.getDatabase();
    try {
      const result = await db.runAsync(sql, params || []);
      return result;
    } catch (error) {
      console.error('Execute error:', error, 'SQL:', sql);
      throw error;
    }
  }

  /**
   * 批量执行 SQL 语句
   */
  public async batch(
    statements: Array<{ sql: string; params?: any[] }>
  ): Promise<void> {
    const db = this.getDatabase();
    try {
      await db.withExclusiveTransactionAsync(async (txn) => {
        for (const statement of statements) {
          await db.runAsync(statement.sql, statement.params || []);
        }
      });
    } catch (error) {
      console.error('Batch execute error:', error);
      throw error;
    }
  }

  /**
   * 事务执行
   */
  public async transaction<T>(
    callback: (db: SQLite.SQLiteDatabase) => Promise<T>
  ): Promise<T> {
    const db = this.getDatabase();
    try {
      let result: T;
      await db.withExclusiveTransactionAsync(async (txn) => {
        result = await callback(db);
      });
      return result!;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }

  /**
   * 清空所有数据
   */
  public async clearAllData(): Promise<void> {
    const db = this.getDatabase();
    try {
      await db.execAsync(`
        DELETE FROM read_history;
        DELETE FROM rss_articles;
        DELETE FROM rss_feeds;
        DELETE FROM user_settings;
      `);
      console.log('All data cleared');
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }
}

/**
 * 导出单例实例
 */
export const dbManager = DatabaseManager.getInstance();

/**
 * 初始化数据库的便利函数
 */
export async function initializeDatabase(): Promise<void> {
  await dbManager.initialize();
}

/**
 * 关闭数据库的便利函数
 */
export async function closeDatabase(): Promise<void> {
  await dbManager.close();
}
