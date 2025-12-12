import React, { useEffect, useState } from "react";
import { useRouter, Link } from "expo-router";
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

/** 分类项目 */
const categoryItem = tva({
  base: "px-4 py-3 border-b border-outline-200 dark:border-outline-700 transition-colors",
});

/** 分类项目容器 */
const categoryItemRow = tva({ base: "flex-row justify-between items-start" });

/** 分类内容 */
const categoryContent = tva({ base: "flex-1" });

/** 分类标题 */
const categoryTitle = tva({
  base: "text-base font-semibold text-typography-900 dark:text-typography-0",
});

/** 分类描述 */
const categoryDescription = tva({
  base: "text-sm text-typography-500 dark:text-typography-400 mt-1",
});

/** 数量徽章 */
const countBadge = tva({
  base: "bg-primary-500 dark:bg-primary-600 rounded-full px-2.5 py-1 ml-2",
});

/** 数量文字 */
const countText = tva({
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

// ========== 组件 ==========

interface Category {
  id: string;
  title: string;
  description?: string;
  count?: number;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
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

        // 尝试获取分类，如果 API 不支持，则从 feeds 中提取
        let categoriesData: Category[] = [];

        try {
          // 尝试直接获取分类（如果 API 支持）
          if (typeof (reader as any).getCategories === "function") {
            categoriesData = await (reader as any).getCategories();
          } else {
            // 从 feeds 中提取分类信息
            const feeds = await reader.getFeeds();
            const categoryMap = new Map<
              string,
              { id: string; title: string; count: number }
            >();

            feeds.forEach((feed: any) => {
              const categoryId = feed.category?.id || "default";
              const categoryTitle = feed.category?.title || "未分类";

              if (categoryMap.has(categoryId)) {
                const existing = categoryMap.get(categoryId)!;
                existing.count += 1;
              } else {
                categoryMap.set(categoryId, {
                  id: categoryId,
                  title: categoryTitle,
                  count: 1,
                });
              }
            });

            categoriesData = Array.from(categoryMap.values());
          }
        } catch (err) {
          console.warn(
            "Categories not supported by API, extracting from feeds"
          );
          // 如果获取分类失败，尝试从 feeds 中提取
          const feeds = await reader.getFeeds();
          const categoryMap = new Map<
            string,
            { id: string; title: string; count: number }
          >();

          feeds.forEach((feed: any) => {
            const categoryId = feed.category?.id || "default";
            const categoryTitle = feed.category?.title || "未分类";

            if (categoryMap.has(categoryId)) {
              const existing = categoryMap.get(categoryId)!;
              existing.count += 1;
            } else {
              categoryMap.set(categoryId, {
                id: categoryId,
                title: categoryTitle,
                count: 1,
              });
            }
          });

          categoriesData = Array.from(categoryMap.values());
        }

        // 设置数据
        setCategories(categoriesData || []);
        console.log("获取到的 Categories:", categoriesData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "获取分类失败";
        console.error("获取分类出错:", err);

        let userMessage = `获取分类失败: ${errorMessage}`;

        if (errorMessage.includes("not implemented")) {
          userMessage = `该 API 不支持分类功能`;
        }

        setError(userMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <Link
      href={{
        pathname: "/feeds",
        params: { categoryId: item.id, categoryName: item.title },
      }}
      asChild
    >
      <Pressable
        onPress={() => {
          router.push({
            pathname: "/feeds",
            params: { categoryId: item.id, categoryName: item.title },
          });
        }}
        android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{ zIndex: 1 }}
      >
        <Box className={categoryItem({})}>
          <Box className={categoryItemRow({})}>
            <Box className={categoryContent({})}>
              <Text className={categoryTitle({})}>{item.title}</Text>
              {item.description && (
                <Text className={categoryDescription({})}>
                  {item.description}
                </Text>
              )}
            </Box>
            {item.count !== undefined && item.count > 0 && (
              <Box className={countBadge({})}>
                <Text className={countText({})}>{item.count}</Text>
              </Box>
            )}
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
          <Text className={title({})}>📁 分类</Text>
        </Box>
        <Text className={subtitle({})}>
          {categories.length > 0
            ? `共 ${categories.length} 个分类`
            : "还没有任何分类"}
        </Text>
      </Box>

      {/* 内容 */}
      {categories.length === 0 ? (
        <Box className={emptyContainer({})}>
          <Box className={emptyContent({})}>
            <Text className={emptyEmoji({})}>📁</Text>
            <Text className={emptyTitle({})}>暂无分类</Text>
            <Text className={emptyText({})}>创建分类以组织订阅源</Text>
          </Box>
        </Box>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          className={flatList({})}
        />
      )}
    </Box>
  );
}
