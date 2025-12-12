/**
 * 缓存层类型定义
 * 基于 libseymour 的接口
 */

import type { IFeed, IFeedItem, ITag, IUnreadCount } from 'libseymour';

/**
 * 分组（Category）类型 - 来自 Feed.categories
 */
export interface Category {
  id: string;
  label: string;
}

/**
 * 缓存状态 - 按照 Item、Feed、Tag、Categories 组织
 */
export interface CacheState {
  items: IFeedItem[]; // 所有文章
  feeds: IFeed[]; // 所有订阅
  tags: ITag[]; // 所有标签
  categories: Category[]; // 所有分组（从 feeds 的 categories 聚合）
  unreadCounts: IUnreadCount[]; // 未读数统计
}

/**
 * 缓存加载状态
 */
export interface CacheLoadingState {
  items: boolean;
  feeds: boolean;
  tags: boolean;
  categories: boolean;
  unreadCounts: boolean;
  overall: boolean; // 整体 loading（任意一个为 true 则为 true）
}

/**
 * 缓存错误状态
 */
export interface CacheErrorState {
  items: Error | null;
  feeds: Error | null;
  tags: Error | null;
  categories: Error | null;
  unreadCounts: Error | null;
}

/**
 * 缓存控制器上下文类型
 */
export interface CacheContextType {
  // 全局状态
  state: CacheState;
  loading: CacheLoadingState;
  error: CacheErrorState;

  // 全局刷新方法
  refreshAll: () => Promise<void>;

  // 单层刷新方法
  refreshFeeds: () => Promise<void>;
  refreshItems: (feedId?: string) => Promise<void>;
  refreshTags: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshUnreadCounts: () => Promise<void>;

  // 定时刷新配置
  setRefreshInterval: (intervalMs: number) => void;
  getRefreshInterval: () => number;

  // 修改数据方法（除了settings）
  updateItem: (item: IFeedItem) => Promise<void>;
  updateFeed: (feed: IFeed) => Promise<void>;
  addTag: (tag: ITag) => Promise<void>;
  removeTag: (tagId: string) => Promise<void>;
}

/**
 * useCachedFeeds 返回类型
 */
export interface UseCachedFeedsReturn {
  feeds: IFeed[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * useCachedItem 返回类型 - 根据 id 获取单个文章
 */
export interface UseCachedItemReturn {
  item: IFeedItem | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * useCachedItems 查询选项 - 根据条件获取文章列表
 */
export interface UseCachedItemsOptions {
  // 基础过滤条件
  categoryId?: string; // 分类ID
  feedId?: string; // 订阅ID（feed.id）
  tagIds?: string[]; // 标签ID列表（tag.id）

  // 高级选项（预留）
  options?: {
    // 读取状态
    readStatus?: 'all' | 'unread' | 'read';
    // 星标状态
    starredStatus?: 'all' | 'starred' | 'unstarred';
    // 搜索关键词
    searchText?: string;
    // 排序方式
    sortBy?: 'date' | 'title';
    sortOrder?: 'asc' | 'desc';
    // 分页
    limit?: number;
    offset?: number;
    // 日期范围（timestamp 毫秒或秒）
    dateRange?: {
      start?: number;
      end?: number;
    };
    // 作者过滤
    author?: string;
  };
}

/**
 * useCachedItems 返回类型 - 获取过滤后的文章列表
 */
export interface UseCachedItemsReturn {
  items: IFeedItem[];
  total: number;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * useCachedTags 返回类型
 */
export interface UseCachedTagsReturn {
  tags: ITag[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * useCachedCategories 返回类型
 */
export interface UseCachedCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * useCacheController 返回类型
 */
export interface UseCacheControllerReturn extends CacheContextType { }
