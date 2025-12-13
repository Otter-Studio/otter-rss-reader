/**
 * 缓存的订阅 Feed hook
 */

import { useContext, useEffect, useState } from 'react';
import { CacheContext } from './context';
import type { UseCachedFeedsReturn } from './types';

/**
 * 获取缓存的订阅列表
 * 页面初始化时自动加载，支持手动刷新
 */
export const useCachedFeeds = (): UseCachedFeedsReturn => {
  const context = useContext(CacheContext);
  const [localLoading, setLocalLoading] = useState(false);

  if (!context) {
    throw new Error('useCachedFeeds must be used within CacheContextProvider');
  }

  // 页面初始化时自动加载一次（CacheManager 会优先从 DB 加载）
  useEffect(() => {
    // 只在缓存完全为空时手动触发刷新
    // CacheManager 初始化时已经触发过一次
    if (context.state.feeds.length === 0 && !context.loading.feeds) {
      context.refreshFeeds().catch((err) => console.warn('Failed to initialize feeds:', err));
    }
  }, []);

  const refresh = async () => {
    setLocalLoading(true);
    try {
      await context.refreshFeeds();
    } catch (err) {
      console.warn('Failed to refresh feeds:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  return {
    feeds: context.state.feeds,
    loading: context.loading.feeds || localLoading,
    error: context.error.feeds,
    refresh,
  };
};
