import React, { useState } from "react";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { FlatList } from "@/components/ui/flat-list";
import { Spinner } from "@/components/ui/spinner";
import { Pressable } from "@/components/ui/pressable";
import { useCachedItems } from "@/hooks/useCache";
import { tva } from "@gluestack-ui/utils/nativewind-utils";

/** 主容器 */
const container = tva({
  base: "flex-1 bg-background-0 dark:bg-background-800",
});

/** 头部 */
const header = tva({
  base: "px-4 py-6 border-b border-outline-200 dark:border-outline-700 bg-background-100 dark:bg-background-900",
});

/** 标题 */
const title = tva({
  base: "text-3xl font-bold text-typography-900 dark:text-typography-0",
});

/** 副标题 */
const subtitle = tva({
  base: "text-sm text-typography-500 dark:text-typography-400",
});

/** Loading 容器 */
const loadingContainer = tva({
  base: "flex-1 bg-background-0 dark:bg-background-800 flex justify-center items-center",
});

/** Loading 内容 */
const loadingContent = tva({ base: "items-center" });

/** Loading 文字 */
const loadingText = tva({
  base: "text-typography-600 dark:text-typography-300 mt-4",
});

/** 错误容器 */
const errorContainer = tva({
  base: "flex-1 bg-background-0 dark:bg-background-800 p-6 flex items-center",
});

/** 错误卡片 */
const errorCard = tva({
  base: "w-full rounded-lg bg-error-50 dark:bg-error-900 p-6 border border-error-200 dark:border-error-700",
});

/** 错误标题 */
const errorTitle = tva({
  base: "text-xl font-bold text-error-600 dark:text-error-300",
});

/** 错误文字 */
const errorMessage = tva({
  base: "text-base text-error-700 dark:text-error-200 mt-3 leading-relaxed",
});

/** 文章项目 */
const itemCard = tva({
  base: "mx-4 mt-4 rounded-lg bg-background-100 dark:bg-background-900 border border-outline-200 dark:border-outline-700 p-4 transition-colors",
});

/** 文章标题 */
const itemTitle = tva({
  base: "text-base font-semibold text-typography-900 dark:text-typography-0 mb-2",
});

/** 文章描述 */
const itemDescription = tva({
  base: "text-sm text-typography-500 dark:text-typography-400 line-clamp-2 mb-3",
});

/** 文章元信息 */
const itemMeta = tva({
  base: "text-xs text-typography-400 dark:text-typography-500",
});

/** 空状态容器 */
const emptyContainer = tva({ base: "flex-1 justify-center items-center px-4" });

/** 空状态内容 */
const emptyContent = tva({ base: "items-center" });

/** 空状态 emoji */
const emptyEmoji = tva({ base: "text-4xl mb-4" });

/** 空状态标题 */
const emptyTitle = tva({
  base: "text-lg font-semibold text-typography-900 dark:text-typography-0",
});

/** 空状态文字 */
const emptyText = tva({
  base: "text-sm text-typography-500 dark:text-typography-400 mt-2 text-center",
});

/** FlatList */
const flatList = tva({ base: "flex-1" });

// ========== 组件 ==========

interface Article {
  id: string;
  title: string;
  summary?: {
    content?: string;
  };
  published?: number;
  author?: string;
  content?: string;
  origin?: {
    title?: string;
    streamId?: string;
  };
}

export default function ItemsPage() {
  const router = useRouter();
  const { tagId, tagName, feedId, feedTitle } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);

  // 根据参数选择过滤条件
  const cacheOptions = tagId
    ? { categoryId: tagId as string }
    : feedId
    ? { feedId: feedId as string }
    : undefined;

  const { items, total, loading, error, refresh } =
    useCachedItems(cacheOptions);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Box className={loadingContainer({})}>
        <Box className={loadingContent({})}>
          <Spinner size="large" />
          <Text className={loadingText({})}>加载中...</Text>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={errorContainer({})}>
        <Box className={errorCard({})}>
          <Text className={errorTitle({})}>⚠️ 加载失败</Text>
          <Text className={errorMessage({})}>{error.message}</Text>
        </Box>
      </Box>
    );
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  };

  const renderItemCard = ({ item }: { item: Article }) => (
    <Link
      href={{
        pathname: "/reader",
        params: { itemId: item.id },
      }}
      asChild
    >
      <Pressable
        onPress={() => {
          router.push({
            pathname: "/reader",
            params: { itemId: item.id },
          });
        }}
        android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{ zIndex: 1 }}
      >
        <Box className={itemCard({})}>
          <Text className={itemTitle({})} numberOfLines={2}>
            {item.title}
          </Text>
          {item.summary?.content && (
            <Text className={itemDescription({})} numberOfLines={2}>
              {item.summary.content}
            </Text>
          )}
          <Box className="flex-row justify-between items-center">
            <Text className={itemMeta({})}>
              {item.origin?.title || "未知来源"}
            </Text>
            <Text className={itemMeta({})}>{formatDate(item.published)}</Text>
          </Box>
        </Box>
      </Pressable>
    </Link>
  );

  return (
    <Box className={container({})}>
      {/* 头部 */}
      <Box className={header({})}>
        <Box className="mb-2">
          <Text className={title({})}>📄 文章</Text>
        </Box>
        <Text className={subtitle({})}>
          {feedTitle
            ? `${feedTitle} · ${total} 篇`
            : tagName
            ? `${tagName} · ${total} 篇`
            : `全部文章 · ${total} 篇`}
        </Text>
      </Box>

      {/* 内容 */}
      {items.length === 0 ? (
        <Box className={emptyContainer({})}>
          <Box className={emptyContent({})}>
            <Text className={emptyEmoji({})}>📭</Text>
            <Text className={emptyTitle({})}>暂无文章</Text>
            <Text className={emptyText({})}>
              {tagName ? "该标签下暂无文章" : "暂无文章"}
            </Text>
          </Box>
        </Box>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItemCard}
          keyExtractor={(item) => item.id}
          className={flatList({})}
          scrollIndicatorInsets={{ right: 1 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={
            <Box className="h-8 flex justify-center items-center mb-4">
              <Text className="text-xs text-typography-500 dark:text-typography-400">
                {items.length} / {total} 篇文章
              </Text>
            </Box>
          }
        />
      )}
    </Box>
  );
}
