import React, { useState } from "react";
import { useRouter, Link, useLocalSearchParams } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { FlatList } from "@/components/ui/flat-list";
import { SectionList } from "@/components/ui/section-list";
import { Spinner } from "@/components/ui/spinner";
import { Pressable } from "@/components/ui/pressable";
import { Switch } from "@/components/ui/switch";
import { useCachedFeeds } from "@/hooks/useCache/useCachedFeeds";
import { useCachedCategories } from "@/hooks/useCache/useCachedCategories";
import type { IFeed } from "libseymour";
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

/** Feed 项目 */
const feedItem = tva({
  base: "px-4 py-3 border-b border-outline-200 dark:border-outline-700 transition-colors",
});

/** Feed 项目容器 */
const feedItemRow = tva({ base: "flex-row justify-between items-start" });

/** Feed 内容 */
const feedContent = tva({ base: "flex-1" });

/** Feed 标题 */
const feedTitle = tva({
  base: "text-base font-semibold text-typography-900 dark:text-typography-0",
});

/** Feed 描述 */
const feedDescription = tva({
  base: "text-sm text-typography-500 dark:text-typography-400 mt-1 line-clamp-2",
});

/** 未读徽章 */
const unreadBadge = tva({
  base: "bg-primary-500 dark:bg-primary-600 rounded-full px-2.5 py-1 ml-2",
});

/** 未读文字 */
const unreadText = tva({
  base: "text-xs font-semibold text-typography-0 dark:text-typography-900",
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

/** 切换容器 */
const switchContainer = tva({
  base: "px-4 py-3 border-b border-outline-200 dark:border-outline-700 flex-row items-center justify-between",
});

/** 切换标签 */
const switchLabel = tva({
  base: "text-sm font-medium text-typography-600 dark:text-typography-300",
});

/** 分组标题 */
const groupHeader = tva({
  base: "px-4 py-2 bg-background-100 dark:bg-background-800 border-t border-outline-200 dark:border-outline-700",
});

/** 分组标题文字 */
const groupHeaderText = tva({
  base: "text-sm font-semibold text-typography-700 dark:text-typography-200",
});

// ========== 组件 ==========

interface FeedWithCategory extends IFeed {
  categoryLabel?: string;
}

export default function FeedsPage() {
  const router = useRouter();
  const { categoryId, categoryName } = useLocalSearchParams();
  const { feeds, loading, error, refresh } = useCachedFeeds();
  const { categories } = useCachedCategories();
  const [isGrouped, setIsGrouped] = useState(false);

  // 如果有 categoryId，过滤订阅源
  const filteredFeeds = categoryId
    ? feeds.filter((feed) =>
        feed.categories?.some((cat) => cat.id === categoryId)
      )
    : feeds;

  // 按分类分组
  const groupedFeeds = (() => {
    if (!isGrouped) return [];

    const groups = new Map<
      string,
      { id: string; title: string; data: FeedWithCategory[] }
    >();

    filteredFeeds.forEach((feed) => {
      // 获取分类标签，如果没有则为"未分类"
      const catId = feed.categories?.[0]?.id || "uncategorized";
      const categoryLabel = feed.categories?.[0]?.label || "未分类";

      if (!groups.has(catId)) {
        groups.set(catId, { id: catId, title: categoryLabel, data: [] });
      }

      const group = groups.get(catId)!;
      group.data.push({ ...feed, categoryLabel });
    });

    // 按类别标题排序
    return Array.from(groups.values()).sort((a, b) =>
      a.title.localeCompare(b.title, "zh-CN")
    );
  })();

  const renderFeedItem = ({ item }: { item: FeedWithCategory }) => (
    <Link
      href={{
        pathname: "/items",
        params: { feedId: item.id, feedTitle: item.title },
      }}
      asChild
    >
      <Pressable
        onPress={() => {
          console.log("Feed item pressed:", item.id, item.title);
          router.push({
            pathname: "/items",
            params: { feedId: item.id, feedTitle: item.title },
          });
        }}
        android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{ zIndex: 1 }}
      >
        <Box className={feedItem({})}>
          <Box className={feedItemRow({})}>
            <Box className={feedContent({})}>
              <Text className={feedTitle({})}>{item.title}</Text>
            </Box>
          </Box>
        </Box>
      </Pressable>
    </Link>
  );

  const renderGroupHeader = ({
    section,
  }: {
    section: { id: string; title: string };
  }) => (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/items",
          params: { categoryId: section.id, categoryName: section.title },
        });
      }}
      android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Box className={groupHeader({})}>
        <Text className={groupHeaderText({})}>{section.title}</Text>
      </Box>
    </Pressable>
  );

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
          <Text className={errorMessage({})}>{error?.message}</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={container({})}>
      {/* 头部 */}
      <Box className={header({})}>
        <Box className="mb-2">
          <Text className={title({})}>📰 订阅源</Text>
        </Box>
        <Text className={subtitle({})}>
          {categoryName
            ? `${categoryName} · ${filteredFeeds.length} 个订阅源`
            : filteredFeeds.length > 0
            ? `共 ${filteredFeeds.length} 个订阅源`
            : "还没有任何订阅"}
        </Text>
      </Box>

      {/* 切换开关 */}
      {filteredFeeds.length > 0 && (
        <Box className={switchContainer({})}>
          <Text className={switchLabel({})}>
            {isGrouped ? "按分类分组" : "列表视图"}
          </Text>
          <Switch
            value={isGrouped}
            onValueChange={setIsGrouped}
            accessible={true}
            accessibilityLabel="Toggle between list and grouped view"
          />
        </Box>
      )}

      {/* 内容 */}
      {filteredFeeds.length === 0 ? (
        <Box className={emptyContainer({})}>
          <Box className={emptyContent({})}>
            <Text className={emptyEmoji({})}>📭</Text>
            <Text className={emptyTitle({})}>暂无订阅源</Text>
            <Text className={emptyText({})}>在设置中添加 RSS 源以开始阅读</Text>
          </Box>
        </Box>
      ) : isGrouped ? (
        <SectionList
          sections={groupedFeeds}
          keyExtractor={(item) => item.id}
          renderItem={renderFeedItem}
          renderSectionHeader={renderGroupHeader}
          className={flatList({})}
        />
      ) : (
        <FlatList
          data={filteredFeeds}
          renderItem={renderFeedItem}
          keyExtractor={(item) => item.id}
          className={flatList({})}
        />
      )}
    </Box>
  );
}
