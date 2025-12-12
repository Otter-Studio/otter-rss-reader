/**
 * 缓存的分组 Categories hook
 */

import { useContext, useEffect, useState } from 'react';
import { CacheContext } from './context';
import type { UseCachedCategoriesReturn } from './types';

/**
 * 获取缓存的分组列表
 * 页面初始化时自动加载，支持手动刷新
 */
export const useCachedCategories = (): UseCachedCategoriesReturn => {
  const context = useContext(CacheContext);
  const [localLoading, setLocalLoading] = useState(false);

  if (!context) {
    throw new Error('useCachedCategories must be used within CacheContextProvider');
  }

  // 页面初始化时自动加载一次（CacheManager 会优先从 DB 加载）
  useEffect(() => {
    // 只在缓存完全为空时手动触发刷新
    // CacheManager 初始化时已经触发过一次
    if (context.state.categories.length === 0 && !context.loading.categories) {
      context.refreshCategories().catch((err) => console.error('Failed to initialize categories:', err));
    }
  }, []);

  const refresh = async () => {
    setLocalLoading(true);
    try {
      await context.refreshCategories();
    } catch (err) {
      console.error('Failed to refresh categories:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  return {
    categories: context.state.categories,
    loading: context.loading.categories || localLoading,
    error: context.error.categories,
    refresh,
  };
};
