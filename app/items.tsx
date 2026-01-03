import React, { useState } from "react";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { FlatList } from "@/components/ui/flat-list";
import { Pressable } from "@/components/ui/pressable";
import { useCachedItems } from "@/hooks/useCache";
import { LoadingBar } from "@/components/otter-ui/loading-bar";
import { tva } from "@gluestack-ui/utils/nativewind-utils";

/** 主容器 */
const container = tva({
  base: "flex-1 bg-background-0",
});

/** 头部 */
const header = tva({
  base: "px-4 py-1 bg-background-50",
});

/** 副标题 */
const subtitle = tva({
  base: "text-sm text-typography-500",
});

/** 错误容器 */
const errorContainer = tva({
  base: "flex-1 bg-background-0 p-6 flex items-center",
});

/** 错误卡片 */
const errorCard = tva({
  base: "w-full rounded-lg bg-error-50 p-6 border border-error-200",
});

/** 错误标题 */
const errorTitle = tva({
  base: "text-xl font-bold text-error-600",
});

/** 错误文字 */
const errorMessage = tva({
  base: "text-base text-error-700 mt-3 leading-relaxed",
});

/** 文章项目 */
const itemCard = tva({
  base: "mx-4 mt-4 rounded-lg bg-background-50 border border-outline-50 p-4 transition-colors",
});

/** 文章标题 */
const itemTitle = tva({
  base: "text-base font-semibold text-typography-900 mb-2",
});

/** 文章描述 */
const itemDescription = tva({
  base: "text-sm text-typography-500 line-clamp-2 mb-3",
});

/** 文章元信息 */
const itemMeta = tva({
  base: "text-xs text-typography-400",
});

/** 空状态容器 */
const emptyContainer = tva({ base: "flex-1 justify-center items-center px-4" });

/** 空状态内容 */
const emptyContent = tva({ base: "items-center" });

/** 空状态 emoji */
const emptyEmoji = tva({ base: "text-4xl mb-4" });

/** 空状态标题 */
const emptyTitle = tva({
  base: "text-lg font-semibold text-typography-900",
});

/** 空状态文字 */
const emptyText = tva({
  base: "text-sm text-typography-500 mt-2 text-center",
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
  const { categoryId, categoryName, feedId, feedTitle } =
    useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);

  // 根据参数选择过滤条件
  const cacheOptions = categoryId
    ? { categoryId: categoryId as string }
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

  function formatDescription(content: string): React.ReactNode {
    // 移除所有 HTML 标签并截取前 300 个字符，移除没用的空格
    return (
      content
        .replace(/<\/?[^>]+(>|$)/g, "")
        .slice(0, 300)
        .trim() + "..."
    );
  }

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
              {formatDescription(item.summary.content)}
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
        <Text className={subtitle({})}>
          {feedTitle
            ? `${feedTitle} · ${total} 篇`
            : categoryName
            ? `${categoryName} · ${total} 篇`
            : `全部文章 · ${total} 篇`}
        </Text>
      </Box>

      <LoadingBar isLoading={loading} />

      {/* 内容 */}
      {items.length === 0 ? (
        <Box className={emptyContainer({})}>
          <Box className={emptyContent({})}>
            <Text className={emptyEmoji({})}>📭</Text>
            <Text className={emptyTitle({})}>暂无文章</Text>
            <Text className={emptyText({})}>
              {categoryName ? "该分类下暂无文章" : "暂无文章"}
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
              <Text className="text-xs text-typography-500">
                {items.length} / {total} 篇文章
              </Text>
            </Box>
          }
        />
      )}
    </Box>
  );
}
