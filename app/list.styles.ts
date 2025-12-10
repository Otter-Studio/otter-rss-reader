import { tv } from 'tailwind-variants'

/**
 * 主容器样式
 */
export const containerStyles = tv({
  base: 'flex-1 bg-background-300 dark:bg-background-900',
})

/**
 * 头部样式
 */
export const headerStyles = tv({
  base: 'px-4 py-6 border-b border-outline-200 dark:border-outline-700 bg-background-0 dark:bg-background-800',
})

/**
 * 标题样式
 */
export const titleStyles = tv({
  base: 'text-3xl font-bold text-text-900 dark:text-text-50',
})

/**
 * 副标题样式
 */
export const subtitleStyles = tv({
  base: 'text-sm text-text-500 dark:text-text-400',
})

/**
 * Loading 容器样式
 */
export const loadingContainerStyles = tv({
  base: 'flex-1 bg-background-300 flex justify-center items-center',
})

/**
 * Loading 内容样式
 */
export const loadingContentStyles = tv({
  base: 'items-center',
})

/**
 * Loading 文字样式
 */
export const loadingTextStyles = tv({
  base: 'text-text-600 mt-4',
})

/**
 * 错误容器样式
 */
export const errorContainerStyles = tv({
  base: 'flex-1 bg-background-300 p-6 flex items-center',
})

/**
 * 错误卡片样式
 */
export const errorCardStyles = tv({
  base: 'w-full rounded-lg bg-red-50 dark:bg-red-950 p-6 border border-red-200 dark:border-red-800',
})

/**
 * 错误标题样式
 */
export const errorTitleStyles = tv({
  base: 'text-xl font-bold text-red-600 dark:text-red-400',
})

/**
 * 错误文字样式
 */
export const errorTextStyles = tv({
  base: 'text-base text-red-700 dark:text-red-300 mt-3 leading-relaxed',
})

/**
 * Feed 项目样式
 */
export const feedItemStyles = tv({
  base: 'px-4 py-3 border-b border-outline-200 hover:bg-background-50 active:bg-background-100 transition-colors',
})

/**
 * Feed 项目容器（flex-row）样式
 */
export const feedItemContainerStyles = tv({
  base: 'flex-row justify-between items-start',
})

/**
 * Feed 项目内容样式
 */
export const feedItemContentStyles = tv({
  base: 'flex-1',
})

/**
 * Feed 标题样式
 */
export const feedTitleStyles = tv({
  base: 'text-base font-semibold text-text-900 dark:text-text-50',
})

/**
 * Feed 描述样式
 */
export const feedDescriptionStyles = tv({
  base: 'text-sm text-text-500 dark:text-text-400 mt-1 line-clamp-2',
})

/**
 * 未读数徽章样式
 */
export const unreadBadgeStyles = tv({
  base: 'bg-primary-500 rounded-full px-2.5 py-1 ml-2',
})

/**
 * 未读数文字样式
 */
export const unreadTextStyles = tv({
  base: 'text-xs font-semibold text-white',
})

/**
 * 空状态容器样式
 */
export const emptyContainerStyles = tv({
  base: 'flex-1 justify-center items-center px-4',
})

/**
 * 空状态内容样式
 */
export const emptyContentStyles = tv({
  base: 'items-center',
})

/**
 * 空状态 emoji 样式
 */
export const emptyEmojiStyles = tv({
  base: 'text-4xl mb-4',
})

/**
 * 空状态标题样式
 */
export const emptyTitleStyles = tv({
  base: 'text-lg font-semibold text-text-900 dark:text-text-50',
})

/**
 * 空状态文字样式
 */
export const emptyTextStyles = tv({
  base: 'text-sm text-text-500 dark:text-text-400 mt-2 text-center',
})

/**
 * FlatList 样式
 */
export const flatListStyles = tv({
  base: 'flex-1',
})
