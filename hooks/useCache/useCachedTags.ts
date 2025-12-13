/**
 * 缓存的标签 hook
 */

import { useContext, useEffect, useState } from 'react';
import { CacheContext } from './context';
import type { UseCachedTagsReturn } from './types';

/**
 * 获取缓存的标签列表
 * 页面初始化时自动加载，支持手动刷新
 */
export const useCachedTags = (): UseCachedTagsReturn => {
  const context = useContext(CacheContext);
  const [localLoading, setLocalLoading] = useState(false);

  if (!context) {
    throw new Error('useCachedTags must be used within CacheContextProvider');
  }

  // 页面初始化时自动加载一次（CacheManager 会优先从 DB 加载）
  useEffect(() => {
    // 只在缓存完全为空时手动触发刷新
    // CacheManager 初始化时已经触发过一次
    if (context.state.tags.length === 0 && !context.loading.tags) {
      context.refreshTags().catch((err) => console.warn('Failed to initialize tags:', err));
    }
  }, []);

  const refresh = async () => {
    setLocalLoading(true);
    try {
      await context.refreshTags();
    } catch (err) {
      console.warn('Failed to refresh tags:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  return {
    tags: context.state.tags,
    loading: context.loading.tags || localLoading,
    error: context.error.tags,
    refresh,
  };
};
