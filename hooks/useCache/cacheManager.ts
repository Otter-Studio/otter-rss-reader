/**
 * 缓存管理器实现
 * 包含：
 * - 数据从 Reader API 获取
 * - 全局状态管理
 * - 定时刷新
 */

import { useState, useEffect, useRef } from 'react';
import type { IFeedItem, IFeed, ITag, IUnreadCount } from 'libseymour';
import { getReader } from '@/api';
import type { CacheContextType, CacheState, CacheLoadingState, CacheErrorState, Category } from './types';

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
   */
  async refreshFeeds(): Promise<void> {
    this.loading.feeds = true;
    this.updateOverallLoading();
    this.notify();

    try {
      const reader = await getReader();
      const feeds = await reader.getFeeds();
      this.state.feeds = feeds;
      this.error.feeds = null;
    } catch (err) {
      this.error.feeds = err instanceof Error ? err : new Error('Unknown error');
      console.error('Failed to refresh feeds:', err);
    } finally {
      this.loading.feeds = false;
      this.updateOverallLoading();
      this.notify();
    }
  }

  /**
   * 刷新文章列表
   */
  async refreshItems(feedId?: string): Promise<void> {
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
            console.error(`Failed to fetch items for feed ${feed.id}:`, err);
          }
        }

        items = allItems;
      }

      this.state.items = items;
      this.error.items = null;
    } catch (err) {
      this.error.items = err instanceof Error ? err : new Error('Unknown error');
      console.error('Failed to refresh items:', err);
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
   */
  async initialize(): Promise<void> {
    await this.refreshAll();
    this.startAutoRefresh();
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.stopAutoRefresh();
    this.listeners.clear();
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
