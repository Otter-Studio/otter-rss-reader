/**
 * 缓存的文章 Item hook
 * 根据 id 获取单个文章
 * 优化：直接从数据库查询，而不是遍历整个数组
 */

import { useContext, useEffect, useState } from 'react';
import { CacheContext } from './context';
import { ArticleOperations } from '@/db';
import type { UseCachedItemReturn } from './types';

interface UseCachedItemOptions {
  id: string;
}

/**
 * 获取缓存的单个文章
 * 优化：优先从缓存查找，如果缓存不存在则直接从数据库查询
 */
export const useCachedItem = (options: UseCachedItemOptions): UseCachedItemReturn => {
  const context = useContext(CacheContext);
  const [localLoading, setLocalLoading] = useState(false);
  const [item, setItem] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  if (!context) {
    throw new Error('useCachedItem must be used within CacheContextProvider');
  }

  // 初始化时获取文章
  useEffect(() => {
    const loadItem = async () => {
      setLocalLoading(true);
      try {
        // 1. 先从缓存中查找（O(1) hash lookup 或 O(n) 数组查找）
        const cachedItem = context.state.items.find((i) => i.id === options.id);
        if (cachedItem) {
          setItem(cachedItem);
          setError(null);
          setLocalLoading(false);
          return;
        }

        // 2. 如果缓存中没有，直接从数据库查询（通过 PRIMARY KEY，O(1) 查询）
        const dbArticle = await ArticleOperations.getArticleById(options.id);
        if (dbArticle) {
          const link = dbArticle.link || '';
          const published = dbArticle.published ?? Date.now();
          const created = dbArticle.createdAt
            ? new Date(dbArticle.createdAt).getTime()
            : published;

          const mappedItem = {
            id: dbArticle.id,
            title: dbArticle.title,
            published,
            author: dbArticle.author || '',
            summary: { content: dbArticle.summary || dbArticle.content || '' },
            canonical: link ? [{ href: link }] : [],
            alternate: link ? [{ href: link }] : [],
            categories: [],
            origin: {
              streamId: dbArticle.feedId,
              htmlUrl: '',
              title: '',
            },
            crawlTimeMsec: created,
            timestampUsec: created * 1000,
          };

          setItem(mappedItem);
          setError(null);
        } else {
          setItem(null);
          setError(new Error('Article not found'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load article'));
        setItem(null);
        console.warn('Failed to load item:', err);
      } finally {
        setLocalLoading(false);
      }
    };

    loadItem();
  }, [options.id, context.state.items]);

  const refresh = async () => {
    setLocalLoading(true);
    try {
      await context.refreshItems();
    } catch (err) {
      console.warn('Failed to refresh items:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  return {
    item,
    loading: localLoading,
    error: error || context.error.items,
    refresh,
  };
};
