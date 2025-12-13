/**
 * 缓存的文章列表 hook
 * 根据条件（分类、订阅、标签等）获取过滤后的文章列表
 */

import { useContext, useEffect, useState, useMemo } from 'react';
import { CacheContext } from './context';
import type { IFeedItem } from 'libseymour';
import type { UseCachedItemsOptions, UseCachedItemsReturn } from './types';

/**
 * 获取缓存的文章列表
 * 支持按分类、订阅、标签等条件过滤和排序
 */
export const useCachedItems = (options?: UseCachedItemsOptions): UseCachedItemsReturn => {
  const context = useContext(CacheContext);
  const [localLoading, setLocalLoading] = useState(false);

  if (!context) {
    throw new Error('useCachedItems must be used within CacheContextProvider');
  }

  // 页面初始化时自动加载一次（CacheManager 会优先从 DB 加载）
  useEffect(() => {
    // 只在缓存完全为空时手动触发刷新
    // CacheManager 初始化时已经触发过一次
    if (context.state.items.length === 0 && !context.loading.items) {
      context.refreshItems(options?.feedId).catch((err) => console.warn('Failed to initialize items:', err));
    }
  }, []);

  const refresh = async () => {
    setLocalLoading(true);
    try {
      await context.refreshItems(options?.feedId);
    } catch (err) {
      console.warn('Failed to refresh items:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  // 根据选项过滤和处理文章列表
  const filteredItems = useMemo(() => {
    let result = [...context.state.items];

    // 1. 按分类过滤
    if (options?.categoryId) {
      const categoryFeeds = context.state.feeds
        .filter((feed) => feed.categories?.some((cat) => cat.id === options.categoryId))
        .map((feed) => feed.id);

      if (categoryFeeds.length > 0) {
        result = result.filter((item) => categoryFeeds.includes(item.origin?.streamId || ''));
      }
    }

    // 2. 按订阅过滤
    if (options?.feedId) {
      result = result.filter((item) => item.origin?.streamId === options?.feedId);
    }

    // 3. 按标签过滤
    // 注：libseymour 的 IFeedItem 暂不支持 tags 属性，预留此功能
    // if (options?.tagIds && options.tagIds.length > 0) {
    //   result = result.filter((item) => {
    //     if (!item.tags || item.tags.length === 0) return false;
    //     const itemTagIds = item.tags.map((tag: any) => tag.id);
    //     return options.tagIds!.some((tagId) => itemTagIds.includes(tagId));
    //   });
    // }

    const opts = options?.options;

    // 4. 按读取状态过滤
    // 注：libseymour 的 IFeedItem 暂不支持 read/starred 属性，预留此功能
    // if (opts?.readStatus && opts.readStatus !== 'all') {
    //   result = result.filter((item) => {
    //     return opts.readStatus === 'unread' ? !item.read : item.read;
    //   });
    // }

    // 5. 按星标状态过滤
    // if (opts?.starredStatus && opts.starredStatus !== 'all') {
    //   result = result.filter((item) => {
    //     return opts.starredStatus === 'starred' ? item.starred : !item.starred;
    //   });
    // }

    // 6. 按搜索关键词过滤
    if (opts?.searchText) {
      const searchLower = opts.searchText.toLowerCase();
      result = result.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(searchLower);
        const summaryMatch = item.summary?.content?.toLowerCase().includes(searchLower) ?? false;
        return titleMatch || summaryMatch;
      });
    }

    // 7. 按作者过滤
    if (opts?.author) {
      result = result.filter((item) => item.author?.includes(opts.author || ''));
    }

    // 8. 按日期范围过滤
    if (opts?.dateRange) {
      // published 是 Unix timestamp（秒），需要转为毫秒比较
      const startTime = opts.dateRange.start ?? 0;
      const endTime = opts.dateRange.end ?? Date.now();

      result = result.filter((item) => {
        const itemTime = item.published ? item.published * 1000 : Date.now();
        return itemTime >= startTime && itemTime <= endTime;
      });
    }

    // 9. 排序
    const sortBy = opts?.sortBy || 'date';
    const sortOrder = opts?.sortOrder || 'desc';

    result.sort((a, b) => {
      let compareValue = 0;

      if (sortBy === 'date') {
        const aTime = a.published ? a.published * 1000 : 0;
        const bTime = b.published ? b.published * 1000 : 0;
        compareValue = aTime - bTime;
      } else if (sortBy === 'title') {
        compareValue = a.title.localeCompare(b.title);
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    // 10. 分页
    if (opts?.limit) {
      const offset = opts?.offset || 0;
      result = result.slice(offset, offset + opts.limit);
    }

    return result;
  }, [context.state.items, context.state.feeds, options]);

  return {
    items: filteredItems,
    total: filteredItems.length,
    loading: context.loading.items || localLoading,
    error: context.error.items,
    refresh,
  };
};
