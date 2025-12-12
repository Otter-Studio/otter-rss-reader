/**
 * useCache hooks 统一导出
 */

export { useCacheController } from './useCacheController';
export { useCachedFeeds } from './useCachedFeeds';
export { useCachedItem } from './useCachedItem';
export { useCachedItems } from './useCachedItems';
export { useCachedTags } from './useCachedTags';
export { useCachedCategories } from './useCachedCategories';
export { CacheContextProvider, CacheContext } from './context';
export type {
  CacheContextType,
  CacheState,
  CacheLoadingState,
  CacheErrorState,
  UseCachedFeedsReturn,
  UseCachedItemReturn,
  UseCachedItemsReturn,
  UseCachedItemsOptions,
  UseCachedTagsReturn,
  UseCachedCategoriesReturn,
  UseCacheControllerReturn,
  Category,
} from './types';
