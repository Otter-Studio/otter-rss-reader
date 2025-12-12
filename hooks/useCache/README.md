# 缓存层设计文档

## 概述

缓存层是一个基于 React Context + Hooks 的全局数据管理方案，用于管理和缓存 RSS 读者的以下数据：
- **Item**（文章）- 从 RSS Feed 中获取的单篇文章
- **Feed**（订阅）- RSS 订阅源
- **Tag**（标签）- 用户创建的标签或状态
- **Categories**（分组）- 从 Feed 的 categories 字段聚合的分组
- **UnreadCounts**（未读数）- 各订阅/标签的未读数统计

## 核心设计原则

1. **单向数据流**：数据从 Reader API 获取 → 同步到 内存缓存 → 通知订阅者更新 UI
2. **软关联**：Item、Feed、Tag、Categories 之间为软关联（通过 id 或其他字段关联，不硬依赖）
3. **整体 loading 状态**：提供 `loading.overall` 来判断是否有任何操作在进行中
4. **自动初始化 + 手动刷新**：页面首次加载时自动刷新数据，后续支持手动刷新
5. **定时刷新**：支持配置定时自动刷新间隔（默认 5 分钟）

## 架构

### 文件结构

```
hooks/useCache/
├── types.ts              # 类型定义
├── context.tsx           # CacheContext 和 CacheContextProvider
├── cacheManager.ts       # CacheManager 类和 useCacheManager hook
├── useCacheController.ts # useCacheController hook
├── useCachedFeeds.ts     # useCachedFeeds hook
├── useCachedItem.ts      # useCachedItem hook
├── useCachedTags.ts      # useCachedTags hook
├── useCachedCategories.ts # useCachedCategories hook
└── index.ts              # 统一导出
```

### 组件关系

```
CacheContextProvider（使用 useCacheManager）
  ├── CacheContext
  └── useCacheManager
      ├── CacheManager（单例管理器）
      │   ├── state（缓存状态）
      │   ├── loading（加载状态）
      │   ├── error（错误状态）
      │   ├── listeners（订阅者）
      │   └── 各种刷新方法
      └── 返回 CacheContextType

Page/Component（使用 hooks）
  ├── useCacheController（获取全局控制器）
  ├── useCachedFeeds（获取订阅列表）
  ├── useCachedItem（获取单个文章）
  ├── useCachedTags（获取标签列表）
  └── useCachedCategories（获取分组列表）
```

## 使用示例

### 1. 包装应用根组件

在应用的根组件中使用 `CacheContextProvider`：

```tsx
import { CacheContextProvider } from '@/hooks/useCache';

export default function App() {
  return (
    <CacheContextProvider>
      {/* 其他组件 */}
    </CacheContextProvider>
  );
}
```

### 2. 在页面中使用单个 hook

#### 获取订阅列表

```tsx
import { useCachedFeeds } from '@/hooks/useCache';

function FeedsPage() {
  const { feeds, loading, error, refresh } = useCachedFeeds();

  if (loading) return <Text>Loading feeds...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      {feeds.map(feed => (
        <Text key={feed.id}>{feed.title}</Text>
      ))}
      <Button onPress={refresh} title="Refresh" />
    </View>
  );
}
```

#### 获取单个文章

```tsx
import { useCachedItem } from '@/hooks/useCache';

function ArticleDetail({ itemId }: { itemId: string }) {
  const { item, loading, error, refresh } = useCachedItem({ id: itemId });

  if (loading) return <Text>Loading article...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (!item) return <Text>Article not found</Text>;

  return (
    <View>
      <Text>{item.title}</Text>
      <Text>{item.summary.content}</Text>
      <Button onPress={refresh} title="Refresh" />
    </View>
  );
}
```

#### 获取标签列表

```tsx
import { useCachedTags } from '@/hooks/useCache';

function TagsPage() {
  const { tags, loading, error, refresh } = useCachedTags();

  if (loading) return <Text>Loading tags...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      {tags.map(tag => (
        <Text key={tag.id}>{tag.id}</Text>
      ))}
      <Button onPress={refresh} title="Refresh" />
    </View>
  );
}
```

#### 获取分组列表

```tsx
import { useCachedCategories } from '@/hooks/useCache';

function CategoriesPage() {
  const { categories, loading, error, refresh } = useCachedCategories();

  if (loading) return <Text>Loading categories...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      {categories.map(category => (
        <Text key={category.id}>{category.label}</Text>
      ))}
      <Button onPress={refresh} title="Refresh" />
    </View>
  );
}
```

### 3. 使用全局控制器

```tsx
import { useCacheController } from '@/hooks/useCache';

function MainPage() {
  const cacheController = useCacheController();
  const { state, loading, error } = cacheController;

  const handleRefreshAll = async () => {
    await cacheController.refreshAll();
  };

  const handleSetRefreshInterval = () => {
    // 设置 10 分钟自动刷新一次
    cacheController.setRefreshInterval(10 * 60 * 1000);
  };

  return (
    <View>
      <Text>Overall Loading: {loading.overall ? 'Yes' : 'No'}</Text>
      <Text>Feeds: {state.feeds.length}</Text>
      <Text>Items: {state.items.length}</Text>
      <Text>Tags: {state.tags.length}</Text>
      <Button onPress={handleRefreshAll} title="Refresh All" />
      <Button onPress={handleSetRefreshInterval} title="Set 10min Interval" />
    </View>
  );
}
```

## 类型定义

### CacheState

```typescript
interface CacheState {
  items: IFeedItem[];      // 所有文章
  feeds: IFeed[];          // 所有订阅
  tags: ITag[];            // 所有标签
  categories: Category[];  // 所有分组
  unreadCounts: IUnreadCount[]; // 未读数统计
}
```

### CacheLoadingState

```typescript
interface CacheLoadingState {
  items: boolean;
  feeds: boolean;
  tags: boolean;
  categories: boolean;
  unreadCounts: boolean;
  overall: boolean;  // 任意一个为 true 则为 true
}
```

### CacheErrorState

```typescript
interface CacheErrorState {
  items: Error | null;
  feeds: Error | null;
  tags: Error | null;
  categories: Error | null;
  unreadCounts: Error | null;
}
```

## 方法说明

### useCacheController

返回 `CacheContextType`，包含以下方法：

#### 全局刷新

- `refreshAll()` - 刷新所有数据（feeds、items、tags、categories、unreadCounts）

#### 单层刷新

- `refreshFeeds()` - 刷新订阅列表
- `refreshItems(feedId?: string)` - 刷新文章列表（可按 feedId 过滤）
- `refreshTags()` - 刷新标签列表
- `refreshCategories()` - 刷新分组列表
- `refreshUnreadCounts()` - 刷新未读数统计

#### 定时控制

- `setRefreshInterval(intervalMs: number)` - 设置自动刷新间隔（毫秒）
- `getRefreshInterval()` - 获取当前自动刷新间隔

#### 数据修改（除了 settings）

- `updateItem(item: IFeedItem)` - 修改单个文章
- `updateFeed(feed: IFeed)` - 修改单个订阅
- `addTag(tag: ITag)` - 添加标签
- `removeTag(tagId: string)` - 删除标签

## 工作流程

### 初始化流程

1. 应用启动，`CacheContextProvider` 初始化
2. `useCacheManager` 创建 `CacheManager` 实例
3. `CacheManager.initialize()` 调用 `refreshAll()`
4. 开启自动刷新定时器（默认 5 分钟）
5. 订阅者 hooks 监听状态变化，自动更新 UI

### 刷新流程

#### 全量刷新（refreshAll）

```
refreshAll()
  ├── refreshFeeds()
  ├── refreshItems()
  ├── refreshTags()
  ├── refreshCategories()（依赖 feeds）
  └── refreshUnreadCounts()
```

#### 单层刷新（如 refreshItems）

1. 设置 `loading.items = true`，更新 `loading.overall`
2. 通知订阅者（触发 UI 更新）
3. 调用 Reader API（`reader.getItems()`）
4. 更新内存缓存 `state.items`
5. 清除错误 `error.items = null`
6. 设置 `loading.items = false`，更新 `loading.overall`
7. 通知订阅者（触发 UI 更新）

### 数据修改流程

```
updateItem(item)
  ├── 在 state.items 中查找该 item
  ├── 替换或新增
  ├── 通知所有订阅者
  └── UI 自动更新
```

## 注意事项

1. **categories 的聚合**：categories 是从所有 feeds 的 categories 字段聚合而来，不是独立的数据源
2. **软关联**：Item 不直接持有 Feed 引用，而是通过 `origin.streamId` 关联
3. **性能优化**：大量文章时，建议使用分页或虚拟列表
4. **错误处理**：每个 hooks 都可独立访问对应的错误信息
5. **内存管理**：组件卸载时，useEffect 清理会自动停止自动刷新和清理订阅

## 未来扩展

1. 添加本地 db 缓存持久化（可选）
2. 添加搜索功能（searchItems、searchFeeds 等）
3. 添加筛选功能（filterByCategory、filterByTag 等）
4. 添加排序功能
5. 添加分页支持
