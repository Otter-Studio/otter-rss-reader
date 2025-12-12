/**
 * 缓存控制上下文
 */

import React, { createContext } from 'react';
import type { CacheContextType } from './types';
import { useCacheManager } from './cacheManager';

export const CacheContext = createContext<CacheContextType | null>(null);

export const CacheContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useCacheManager();

  return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>;
};
