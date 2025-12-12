import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { FlatList } from "@/components/ui/flat-list";
import { Spinner } from "@/components/ui/spinner";
import { Pressable } from "@/components/ui/pressable";
import { getReader } from "@/api";
import { SettingsOperations } from "@/db";
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

interface Item {
  id: string;
  title: string;
  summary?: string;
  published?: number;
  author?: string;
  content?: string;
}

export default function ItemsPage() {
  const router = useRouter();
  const { tagId, tagName } = useLocalSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        // 先检查用户信息是否已配置
        const userInfo = await SettingsOperations.getUserInfo();

        if (!userInfo || !userInfo.baseUrl) {
          setError(
            "API 服务器未配置。请先在设置中配置 Server URL、用户名和密码。"
          );
          setLoading(false);
          return;
        }

        if (!userInfo.username || !userInfo.password) {
          setError("用户名或密码未配置。请先在设置中完整配置认证信息。");
          setLoading(false);
          return;
        }

        // 获取 API 实例
        const reader = await getReader();

        // 根据 tagId 获取文章列表
        let itemsData = [];
        if (tagId && typeof tagId === "string") {
          // 如果有 tagId，先获取该标签下的所有feed，然后获取这些feed的文章
          // 这里作为示例，实际实现可能需要根据 API 的具体支持
          itemsData = (await reader.getItems?.(tagId)) || [];
        } else {
          // 获取所有文章 - 这需要遍历所有feed
          const feeds = await reader.getFeeds();
          const allItems: any[] = [];

          for (const feed of feeds) {
            try {
              const feedItems = await reader.getItems(feed.id);
              allItems.push(...feedItems);
            } catch (err) {
              console.error(`Failed to fetch items for feed ${feed.id}:`, err);
            }
          }
          itemsData = allItems;
        }

        setItems(itemsData || []);
        console.log("获取到的 Items:", itemsData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "获取文章列表失败";
        console.error("获取文章列表出错:", err);

        let userMessage = `获取文章列表失败: ${errorMessage}`;

        setError(userMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [tagId]);

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
          <Text className={errorTitle()}>⚠️ 加载失败</Text>
          <Text className={errorMessage({})}>{error}</Text>
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

  const renderItemCard = ({ item }: { item: Item }) => (
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
          {item.summary && (
            <Text className={itemDescription({})} numberOfLines={2}>
              {item.summary}
            </Text>
          )}
          <Box className="flex-row justify-between items-center">
            <Text className={itemMeta({})}>
              {item.author && `作者: ${item.author}`}
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
          {tagName ? `标签: ${tagName}` : "所有文章"} • {items.length} 篇
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
        />
      )}
    </Box>
  );
}
