/**
 * 缓存的文章 Item hook
 * 根据 id 获取单个文章
 */

import { useContext, useEffect, useState } from 'react';
import { CacheContext } from './context';
import type { UseCachedItemReturn } from './types';

interface UseCachedItemOptions {
  id: string;
}

/**
 * 获取缓存的单个文章
 * 根据 id 从缓存中获取，支持手动刷新
 */
export const useCachedItem = (options: UseCachedItemOptions): UseCachedItemReturn => {
  const context = useContext(CacheContext);
  const [localLoading, setLocalLoading] = useState(false);

  if (!context) {
    throw new Error('useCachedItem must be used within CacheContextProvider');
  }

  // 页面初始化时自动加载一次（如果缓存为空）
  useEffect(() => {
    if (context.state.items.length === 0 && !context.loading.items) {
      context.refreshItems().catch((err) => console.error('Failed to initialize items:', err));
    }
  }, [context, options.id]);

  const refresh = async () => {
    setLocalLoading(true);
    try {
      await context.refreshItems();
    } catch (err) {
      console.error('Failed to refresh items:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  // 从缓存中查找指定 id 的文章
  const item = context.state.items.find((i) => i.id === options.id) || null;

  return {
    item,
    loading: context.loading.items || localLoading,
    error: context.error.items,
    refresh,
  };
};
