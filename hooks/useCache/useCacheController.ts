/**
 * 缓存控制器 hook
 * 负责全局缓存的初始化、刷新、定时更新等
 */

import { useContext } from 'react';
import { CacheContext } from './context';
import type { UseCacheControllerReturn } from './types';

export const useCacheController = (): UseCacheControllerReturn => {
  const context = useContext(CacheContext);

  if (!context) {
    throw new Error('useCacheController must be used within CacheContextProvider');
  }

  return context;
};
