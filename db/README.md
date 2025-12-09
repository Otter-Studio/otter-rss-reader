# Realm 数据库架构

这是 Otter RSS Reader 的 Realm 数据库实现，采用了模块化的架构设计。

## 目录结构

```
db/
├── index.ts                    # 统一导出入口
├── initialize.ts               # 数据库初始化和实例管理
├── usage.example.ts            # 使用示例
├── models/                     # 数据模型
│   ├── index.ts               # 模型统一导出
│   ├── RSSFeed.ts             # RSS Feed 模型
│   ├── RSSArticle.ts          # RSS 文章模型
│   ├── UserSettings.ts        # 用户设置模型
│   └── ReadHistory.ts         # 阅读历史模型
└── operations/                # 数据库操作
    ├── index.ts               # 操作统一导出
    ├── feed.ts                # Feed 操作
    ├── article.ts             # 文章操作
    ├── settings.ts            # 设置操作
    ├── history.ts             # 历史操作
    └── utils.ts               # 工具函数
```

## 数据模型

### RSSFeed (RSS 源)
```typescript
interface RSSFeed {
  id: string;                    // 唯一标识
  title: string;                 // 标题
  description?: string;          // 描述
  url: string;                   // RSS 源 URL
  link?: string;                 // 源网站链接
  image?: string;                // 源图标/图片 URL
  category?: string;             // 分类
  author?: string;               // 作者
  language?: string;             // 语言
  lastUpdated?: Date;            // 最后更新时间
  createdAt: Date;               // 创建时间
  isActive: boolean;             // 是否活跃
  articles: RSSArticle[];        // 包含的文章列表
}
```

### RSSArticle (RSS 文章)
```typescript
interface RSSArticle {
  id: string;                    // 唯一标识
  title: string;                 // 标题
  description?: string;          // 描述
  content?: string;              // 完整内容
  author?: string;               // 作者
  link: string;                  // 文章链接
  image?: string;                // 文章图片 URL
  pubDate?: Date;                // 发布时间
  createdAt: Date;               // 添加到数据库的时间
  isRead: boolean;               // 是否已读
  isStarred: boolean;            // 是否已星标
  feed: RSSFeed;                 // 关联的 Feed
  category?: string;             // 分类
  guid?: string;                 // 全局唯一标识
}
```

### UserSettings (用户设置)
```typescript
interface UserSettings {
  id: string;                    // 唯一标识 (通常为 'default-settings')
  theme: 'light' | 'dark' | 'system';  // 主题
  refreshInterval: number;       // 刷新间隔 (秒)
  articlesPerPage: number;       // 每页文章数
  language: string;              // 语言
  autoMarkAsRead: boolean;       // 自动标记为已读
  notificationsEnabled: boolean; // 是否启用通知
  lastSyncTime?: Date;           // 最后同步时间
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}
```

### ReadHistory (阅读历史)
```typescript
interface ReadHistory {
  id: string;                    // 唯一标识
  articleId: string;             // 文章 ID
  articleTitle: string;          // 文章标题
  readAt: Date;                  // 阅读时间
  timeSpent: number;             // 阅读时长 (秒)
  scrollPosition: number;        // 滚动位置
}
```

## API 文档

### 初始化

```typescript
import { initializeDatabase, closeDatabase } from './db';

// 应用启动时
await initializeDatabase();

// 应用关闭时
closeDatabase();
```

### Feed 操作

```typescript
import { FeedOperations } from './db';

// 添加 Feed
const feed = FeedOperations.addFeed({
  id: 'feed-1',
  title: 'My Blog',
  url: 'https://example.com/rss',
  // ... 其他字段
});

// 获取所有 Feed
const feeds = FeedOperations.getAllFeeds();

// 获取活跃的 Feed
const activeFeeds = FeedOperations.getActiveFeeds();

// 按 ID 获取 Feed
const feed = FeedOperations.getFeedById('feed-1');

// 更新 Feed
const updated = FeedOperations.updateFeed('feed-1', {
  title: 'New Title',
  description: 'New description'
});

// 删除 Feed
FeedOperations.deleteFeed('feed-1');

// 按类别获取 Feed
const techFeeds = FeedOperations.getFeedsByCategory('Technology');

// 更新最后更新时间
FeedOperations.updateLastUpdated('feed-1');
```

### 文章操作

```typescript
import { ArticleOperations } from './db';

// 添加文章
const article = ArticleOperations.addArticle({
  id: 'article-1',
  title: 'Article Title',
  link: 'https://example.com/article',
  feedId: 'feed-1',
  // ... 其他字段
});

// 获取 Feed 的文章
const articles = ArticleOperations.getArticlesByFeed('feed-1', limit);

// 获取未读文章
const unreadArticles = ArticleOperations.getUnreadArticles(limit);

// 获取已星标文章
const starredArticles = ArticleOperations.getStarredArticles(limit);

// 按 ID 获取文章
const article = ArticleOperations.getArticleById('article-1');

// 标记为已读
ArticleOperations.markAsRead('article-1');

// 标记为未读
ArticleOperations.markAsUnread('article-1');

// 切换星标
ArticleOperations.toggleStar('article-1');

// 标记 Feed 的所有文章为已读
ArticleOperations.markFeedArticlesAsRead('feed-1');

// 删除文章
ArticleOperations.deleteArticle('article-1');

// 删除旧文章 (30 天前)
ArticleOperations.deleteOldArticles(30);

// 获取统计信息
const stats = ArticleOperations.getArticleStats();
// { total: number, unread: number, starred: number }
```

### 设置操作

```typescript
import { SettingsOperations } from './db';

// 初始化设置
const settings = SettingsOperations.initializeSettings();

// 获取设置
const settings = SettingsOperations.getSettings();

// 更新设置
const updated = SettingsOperations.updateSettings({
  theme: 'dark',
  language: 'zh',
  refreshInterval: 1800
});

// 重置为默认设置
const reset = SettingsOperations.resetToDefaults();
```

### 历史操作

```typescript
import { HistoryOperations } from './db';

// 添加阅读历史
const history = HistoryOperations.addHistory('article-1', 'Article Title', 120);

// 获取最近的历史 (默认 50 条)
const history = HistoryOperations.getHistory(20);

// 获取特定文章的历史
const history = HistoryOperations.getArticleHistory('article-1');

// 清空历史
HistoryOperations.clearHistory();

// 删除旧历史 (90 天前)
HistoryOperations.deleteOldHistory(90);
```

### 工具函数

```typescript
import { DatabaseUtils } from './db';

// 获取统计信息
const stats = DatabaseUtils.getStatistics();
// { feeds, articles, unreadArticles, starredArticles, historyEntries }

// 导出数据为 JSON
const data = DatabaseUtils.exportData();

// 获取数据库路径
const path = DatabaseUtils.getRealmPath();

// 清空所有数据
DatabaseUtils.clearAllData();
```

## 使用示例

详见 `db/usage.example.ts` 文件，包含了所有 API 的完整使用示例。

### 快速开始

```typescript
import {
  initializeDatabase,
  closeDatabase,
  FeedOperations,
  ArticleOperations,
  SettingsOperations,
  HistoryOperations
} from './db';

// 1. 初始化数据库
await initializeDatabase();

// 2. 初始化设置
SettingsOperations.initializeSettings();

// 3. 添加 Feed
const feed = FeedOperations.addFeed({
  id: 'rss-feed-1',
  title: 'My Blog',
  url: 'https://example.com/rss'
});

// 4. 添加文章
const article = ArticleOperations.addArticle({
  id: 'article-1',
  title: 'First Article',
  link: 'https://example.com/article-1',
  feedId: feed.id
});

// 5. 标记为已读
ArticleOperations.markAsRead(article.id);

// 6. 添加阅读历史
HistoryOperations.addHistory(article.id, article.title, 60);

// 7. 关闭数据库
closeDatabase();
```

## 最佳实践

1. **初始化**: 应用启动时调用 `initializeDatabase()`
2. **清理**: 应用关闭时调用 `closeDatabase()`
3. **批量操作**: 使用 Realm 的 write 事务进行批量更新
4. **错误处理**: 所有数据库操作都应该包含错误处理
5. **数据验证**: 在添加/更新数据前验证数据的有效性
6. **性能**: 使用 limit 参数限制查询结果，避免加载过多数据

## 迁移指南

如果你之前使用了其他数据库实现，按以下步骤迁移：

1. 导出旧数据
2. 调用 `initializeDatabase()` 初始化 Realm
3. 使用新的 API 重新导入数据
4. 测试所有功能
5. 删除旧数据库文件
