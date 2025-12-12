/**
 * 缓存管理器实现
 * 包含：
 * - 数据从 Reader API 获取
 * - 全局状态管理
 * - 定时刷新
 * - 数据库本地缓存集成
 */

import { useState, useEffect, useRef } from 'react';
import type { IFeedItem, IFeed, ITag, IUnreadCount } from 'libseymour';
import { getReader } from '@/api';
import type { CacheContextType, CacheState, CacheLoadingState, CacheErrorState, Category } from './types';
import { FeedOperations } from '@/db/feed';
import { ArticleOperations } from '@/db/article';

/**
 * 缓存管理器类
 * 管理所有缓存的初始化、刷新、定时更新等
 */
export class CacheManager {
  private state: CacheState;
  private loading: CacheLoadingState;
  private error: CacheErrorState;
  private refreshInterval: number = 5 * 60 * 1000; // 默认 5 分钟
  private refreshTimer: NodeJS.Timeout | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = {
      items: [],
      feeds: [],
      tags: [],
      categories: [],
      unreadCounts: [],
    };
    this.loading = {
      items: false,
      feeds: false,
      tags: false,
      categories: false,
      unreadCounts: false,
      overall: false,
    };
    this.error = {
      items: null,
      feeds: null,
      tags: null,
      categories: null,
      unreadCounts: null,
    };
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 通知所有订阅者
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * 更新整体 loading 状态
   */
  private updateOverallLoading(): void {
    this.loading.overall =
      this.loading.items ||
      this.loading.feeds ||
      this.loading.tags ||
      this.loading.categories ||
      this.loading.unreadCounts;
  }

  /**
   * 获取当前状态
   */
  getState(): CacheState {
    return this.state;
  }

  /**
   * 获取加载状态
   */
  getLoading(): CacheLoadingState {
    return this.loading;
  }

  /**
   * 获取错误状态
   */
  getError(): CacheErrorState {
    return this.error;
  }

  /**
   * 全量刷新：刷新 feeds、items、tags、categories、unreadCounts
   * 优先从数据库加载，后台异步更新
   */
  async refreshAll(): Promise<void> {
    await Promise.all([
      this.refreshFeeds(),
      this.refreshItems(),
      this.refreshTags(),
      this.refreshCategories(),
      this.refreshUnreadCounts(),
    ]);
  }

  /**
   * 刷新订阅列表
   * 策略：
   * 1. 立即从数据库加载（无阻塞显示）
   * 2. 设置轻量级加载状态
   * 3. 后台异步从 API 更新
   */
  async refreshFeeds(isInitialLoad: boolean = false): Promise<void> {
    // Step 1: 先从数据库快速加载，立即显示（不阻塞 UI）
    const shouldLoadFromDb = isInitialLoad || this.state.feeds.length === 0;

    if (shouldLoadFromDb) {
      try {
        const dbFeeds = await FeedOperations.getActiveFeeds();
        if (dbFeeds.length > 0) {
          // 转换 DB 格式到 IFeed 格式并立即显示
          this.state.feeds = dbFeeds.map((feed: any) => ({
            id: feed.id,
            title: feed.title,
            url: feed.url,
            htmlUrl: feed.link || '',
            iconUrl: feed.image || '',
            categories: feed.category ? [{ id: feed.id, label: feed.category }] : [],
          })) as any;

          // 轻量级加载状态 - 表示有本地数据
          if (isInitialLoad) {
            console.log(`[Cache] Loaded ${dbFeeds.length} feeds from DB (initial)`);
            this.notify();
          }
        }
      } catch (err) {
        console.error('[Cache] Failed to load feeds from DB:', err);
      }
    }

    // Step 2: 后台异步从 API 更新（不阻塞）
    this.loading.feeds = true;
    this.updateOverallLoading();
    this.notify();

    try {
      const reader = await getReader();
      const feeds = await reader.getFeeds();
      this.state.feeds = feeds;

      // 同时保存到数据库（异步，不等待）
      this._syncFeedsToDb(feeds).catch((err: any) =>
        console.warn('[Cache] Failed to sync feeds to DB:', err)
      );

      this.error.feeds = null;
      console.log(`[Cache] Updated ${feeds.length} feeds from API`);
    } catch (err) {
      this.error.feeds = err instanceof Error ? err : new Error('Unknown error');
      console.error('[Cache] Failed to refresh feeds from API:', err);
    } finally {
      this.loading.feeds = false;
      this.updateOverallLoading();
      this.notify();
    }
  }

  /**
   * 刷新文章列表
   * 策略：先从数据库加载，后台异步更新
   */
  async refreshItems(feedId?: string): Promise<void> {
    // Step 1: 先从数据库快速加载
    const shouldLoadFromDb = this.state.items.length === 0;

    if (shouldLoadFromDb) {
      try {
        const dbArticles = feedId
          ? await ArticleOperations.getArticlesByFeed(feedId)
          : await ArticleOperations.getRecentArticles(500);

        if (dbArticles.length > 0) {
          // 转换 DB 格式并立即显示
          this.state.items = dbArticles.map((article: any) => ({
            id: article.guid || article.id,
            title: article.title,
            published: new Date(article.pub_date).getTime(),
            author: article.author || '',
            summary: {
              content: article.description || '',
            },
            canonical: article.link ? [{ href: article.link }] : [],
            alternate: article.link ? [{ href: article.link }] : [],
            categories: [],
            origin: {
              streamId: article.feed_id,
              htmlUrl: '',
              title: '',
            },
            crawlTimeMsec: new Date(article.created_at).getTime(),
            timestampUsec: new Date(article.created_at).getTime() * 1000,
          })) as any;

          console.log(`[Cache] Loaded ${dbArticles.length} items from DB (feedId: ${feedId || 'all'})`);
          this.notify();
        }
      } catch (err) {
        console.error('[Cache] Failed to load items from DB:', err);
      }
    }

    // Step 2: 后台异步从 API 更新
    this.loading.items = true;
    this.updateOverallLoading();
    this.notify();

    try {
      const reader = await getReader();
      let items: IFeedItem[] = [];

      if (feedId) {
        // 刷新特定订阅的文章
        items = await reader.getItems(feedId);
      } else {
        // 刷新所有订阅的文章
        const feeds = this.state.feeds;
        const allItems: IFeedItem[] = [];

        for (const feed of feeds) {
          try {
            const feedItems = await reader.getItems(feed.id);
            allItems.push(...feedItems);
          } catch (err) {
            console.error(`[Cache] Failed to fetch items for feed ${feed.id}:`, err);
          }
        }

        items = allItems;
      }

      this.state.items = items;

      // 同时保存到数据库（异步，不等待）
      this._syncArticlesToDb(items).catch((err: any) =>
        console.warn('[Cache] Failed to sync articles to DB:', err)
      );

      this.error.items = null;
      console.log(`[Cache] Updated ${items.length} items from API (feedId: ${feedId || 'all'})`);
    } catch (err) {
      this.error.items = err instanceof Error ? err : new Error('Unknown error');
      console.error('[Cache] Failed to refresh items from API:', err);
    } finally {
      this.loading.items = false;
      this.updateOverallLoading();
      this.notify();
    }
  }

  /**
   * 刷新标签列表
   */
  async refreshTags(): Promise<void> {
    this.loading.tags = true;
    this.updateOverallLoading();
    this.notify();

    try {
      const reader = await getReader();
      const tags = await reader.getTags();
      this.state.tags = tags;
      this.error.tags = null;
    } catch (err) {
      this.error.tags = err instanceof Error ? err : new Error('Unknown error');
      console.error('Failed to refresh tags:', err);
    } finally {
      this.loading.tags = false;
      this.updateOverallLoading();
      this.notify();
    }
  }

  /**
   * 刷新分组列表（从 feeds 的 categories 聚合）
   */
  async refreshCategories(): Promise<void> {
    this.loading.categories = true;
    this.updateOverallLoading();
    this.notify();

    try {
      // 从 feeds 的 categories 聚合分组
      const categoriesMap = new Map<string, Category>();

      for (const feed of this.state.feeds) {
        for (const category of feed.categories) {
          if (!categoriesMap.has(category.id)) {
            categoriesMap.set(category.id, category);
          }
        }
      }

      this.state.categories = Array.from(categoriesMap.values());
      this.error.categories = null;
    } catch (err) {
      this.error.categories = err instanceof Error ? err : new Error('Unknown error');
      console.error('Failed to refresh categories:', err);
    } finally {
      this.loading.categories = false;
      this.updateOverallLoading();
      this.notify();
    }
  }

  /**
   * 刷新未读数统计
   */
  async refreshUnreadCounts(): Promise<void> {
    this.loading.unreadCounts = true;
    this.updateOverallLoading();
    this.notify();

    try {
      const reader = await getReader();
      const unreadCounts = await reader.getUnreadCounts();
      this.state.unreadCounts = unreadCounts;
      this.error.unreadCounts = null;
    } catch (err) {
      this.error.unreadCounts = err instanceof Error ? err : new Error('Unknown error');
      console.error('Failed to refresh unread counts:', err);
    } finally {
      this.loading.unreadCounts = false;
      this.updateOverallLoading();
      this.notify();
    }
  }

  /**
   * 设置定时刷新间隔
   */
  setRefreshInterval(intervalMs: number): void {
    this.refreshInterval = intervalMs;
    this.stopAutoRefresh();
    this.startAutoRefresh();
  }

  /**
   * 获取定时刷新间隔
   */
  getRefreshInterval(): number {
    return this.refreshInterval;
  }

  /**
   * 启动自动刷新
   */
  startAutoRefresh(): void {
    if (this.refreshTimer) {
      return;
    }
    this.refreshTimer = setInterval(() => {
      this.refreshAll().catch((err) => console.error('Auto refresh failed:', err));
    }, this.refreshInterval);
  }

  /**
   * 停止自动刷新
   */
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * 修改文章
   */
  async updateItem(item: IFeedItem): Promise<void> {
    const index = this.state.items.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      this.state.items[index] = item;
      this.notify();
    }
  }

  /**
   * 修改订阅
   */
  async updateFeed(feed: IFeed): Promise<void> {
    const index = this.state.feeds.findIndex((f) => f.id === feed.id);
    if (index !== -1) {
      this.state.feeds[index] = feed;
      this.notify();
    }
  }

  /**
   * 添加标签
   */
  async addTag(tag: ITag): Promise<void> {
    if (!this.state.tags.find((t) => t.id === tag.id)) {
      this.state.tags.push(tag);
      this.notify();
    }
  }

  /**
   * 删除标签
   */
  async removeTag(tagId: string): Promise<void> {
    this.state.tags = this.state.tags.filter((t) => t.id !== tagId);
    this.notify();
  }

  /**
   * 初始化缓存
   * 优先从数据库加载，后台异步更新
   */
  async initialize(): Promise<void> {
    try {
      // Step 1: 从数据库快速加载（无阻塞）
      console.log('[Cache] Initializing from DB...');
      await Promise.all([
        this.refreshFeeds(true),  // 初始加载，优先用 DB
        this.refreshItems(),
      ]);

      // Step 2: 启动后台定时刷新
      this.startAutoRefresh();
      console.log('[Cache] Initialization complete, auto-refresh started');
    } catch (err) {
      console.error('[Cache] Initialization failed:', err);
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.stopAutoRefresh();
    this.listeners.clear();
  }

  /**
   * 将 Feed 同步到数据库（异步）
   */
  private async _syncFeedsToDb(feeds: IFeed[]): Promise<void> {
    try {
      for (const feed of feeds) {
        const existing = await FeedOperations.getFeedById(feed.id);
        if (existing) {
          // 更新现有的 Feed
          await FeedOperations.updateFeed(feed.id, {
            title: feed.title,
            link: feed.htmlUrl,
            image: feed.iconUrl,
            category: feed.categories[0]?.label,
          });
        } else {
          // 新增 Feed
          await FeedOperations.addFeed({
            title: feed.title,
            url: feed.url || feed.id,
            link: feed.htmlUrl,
            image: feed.iconUrl,
            category: feed.categories[0]?.label,
          });
        }
      }
      console.log(`[Cache] Synced ${feeds.length} feeds to DB`);
    } catch (err) {
      console.error('[Cache] Error syncing feeds to DB:', err);
    }
  }

  /**
   * 将 Article 同步到数据库（异步）
   */
  private async _syncArticlesToDb(items: IFeedItem[]): Promise<void> {
    try {
      // 批量添加文章到数据库
      const articlesToAdd = items.map(item => ({
        title: item.title,
        link: item.canonical[0]?.href || item.alternate[0]?.href || item.id,
        feed_id: item.origin.streamId,
        description: item.summary?.content || '',
        author: item.author || '',
        pub_date: new Date(item.published).toISOString(),
        guid: item.id,
      }));

      await ArticleOperations.addArticlesInBatch(articlesToAdd as any);
      console.log(`[Cache] Synced ${items.length} articles to DB`);
    } catch (err) {
      console.error('[Cache] Error syncing articles to DB:', err);
    }
  }
}

/**
 * 使用 CacheManager 的 hook
 */
export const useCacheManager = (): CacheContextType => {
  const managerRef = useRef<CacheManager>(new CacheManager());
  const [state, setState] = useState(managerRef.current.getState());
  const [loading, setLoading] = useState(managerRef.current.getLoading());
  const [error, setError] = useState(managerRef.current.getError());

  useEffect(() => {
    const manager = managerRef.current;

    // 初始化缓存
    manager.initialize().catch((err) => console.error('Failed to initialize cache:', err));

    // 订阅状态变化
    const unsubscribe = manager.subscribe(() => {
      setState({ ...manager.getState() });
      setLoading({ ...manager.getLoading() });
      setError({ ...manager.getError() });
    });

    // 清理
    return () => {
      unsubscribe();
      manager.destroy();
    };
  }, []);

  const contextValue: CacheContextType = {
    state,
    loading,
    error,
    refreshAll: () => managerRef.current.refreshAll(),
    refreshFeeds: () => managerRef.current.refreshFeeds(),
    refreshItems: (feedId?: string) => managerRef.current.refreshItems(feedId),
    refreshTags: () => managerRef.current.refreshTags(),
    refreshCategories: () => managerRef.current.refreshCategories(),
    refreshUnreadCounts: () => managerRef.current.refreshUnreadCounts(),
    setRefreshInterval: (intervalMs: number) => managerRef.current.setRefreshInterval(intervalMs),
    getRefreshInterval: () => managerRef.current.getRefreshInterval(),
    updateItem: (item: IFeedItem) => managerRef.current.updateItem(item),
    updateFeed: (feed: IFeed) => managerRef.current.updateFeed(feed),
    addTag: (tag: ITag) => managerRef.current.addTag(tag),
    removeTag: (tagId: string) => managerRef.current.removeTag(tagId),
  };

  return contextValue;
};
