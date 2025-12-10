import React, { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { FlatList } from "@/components/ui/flat-list";
import { Spinner } from "@/components/ui/spinner";
import { getReader } from "@/api";
import { SettingsOperations } from "@/db";
import { tv } from "tailwind-variants";

// ========== 样式定义 ==========

/** 主容器 */
const container = tv({ base: "flex-1 bg-background-300 dark:bg-background-900" });

/** 头部 */
const header = tv({ base: "px-4 py-6 border-b border-outline-200 dark:border-outline-700 bg-background-0 dark:bg-background-800" });

/** 标题 */
const title = tv({ base: "text-3xl font-bold text-text-900 dark:text-text-50" });

/** 副标题 */
const subtitle = tv({ base: "text-sm text-text-500 dark:text-text-400" });

/** Loading 容器 */
const loadingContainer = tv({ base: "flex-1 bg-background-300 flex justify-center items-center" });

/** Loading 内容 */
const loadingContent = tv({ base: "items-center" });

/** Loading 文字 */
const loadingText = tv({ base: "text-text-600 mt-4" });

/** 错误容器 */
const errorContainer = tv({ base: "flex-1 bg-background-300 p-6 flex items-center" });

/** 错误卡片 */
const errorCard = tv({ base: "w-full rounded-lg bg-red-50 dark:bg-red-950 p-6 border border-red-200 dark:border-red-800" });

/** 错误标题 */
const errorTitle = tv({ base: "text-xl font-bold text-red-600 dark:text-red-400" });

/** 错误文字 */
const errorMessage = tv({ base: "text-base text-red-700 dark:text-red-300 mt-3 leading-relaxed" });

/** Feed 项目 */
const feedItem = tv({ base: "px-4 py-3 border-b border-outline-200 hover:bg-background-50 active:bg-background-100 transition-colors" });

/** Feed 项目容器 */
const feedItemRow = tv({ base: "flex-row justify-between items-start" });

/** Feed 内容 */
const feedContent = tv({ base: "flex-1" });

/** Feed 标题 */
const feedTitle = tv({ base: "text-base font-semibold text-text-900 dark:text-text-50" });

/** Feed 描述 */
const feedDescription = tv({ base: "text-sm text-text-500 dark:text-text-400 mt-1 line-clamp-2" });

/** 未读徽章 */
const unreadBadge = tv({ base: "bg-primary-500 rounded-full px-2.5 py-1 ml-2" });

/** 未读文字 */
const unreadText = tv({ base: "text-xs font-semibold text-white" });

/** 空状态容器 */
const emptyContainer = tv({ base: "flex-1 justify-center items-center px-4" });

/** 空状态内容 */
const emptyContent = tv({ base: "items-center" });

/** 空状态 emoji */
const emptyEmoji = tv({ base: "text-4xl mb-4" });

/** 空状态标题 */
const emptyTitle = tv({ base: "text-lg font-semibold text-text-900 dark:text-text-50" });

/** 空状态文字 */
const emptyText = tv({ base: "text-sm text-text-500 dark:text-text-400 mt-2 text-center" });

/** FlatList */
const flatList = tv({ base: "flex-1" });

// ========== 组件 ==========

interface Feed {
  id: string;
  title: string;
  description?: string;
  unread_count?: number;
}

export default function ListPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        setLoading(true);
        setError(null);

        // 先检查用户信息是否已配置
        const userInfo = await SettingsOperations.getUserInfo();
        console.log("用户信息:", userInfo);

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
        console.log("API 已初始化");

        // 调用 API 获取 feeds
        const reader = await getReader();
        const feedsData = await reader.getFeeds();

        // 设置数据
        setFeeds(feedsData || []);
        console.log("获取到的 Feeds:", feedsData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "获取 feeds 失败";
        console.error("获取 feeds 出错 - 完整错误:", err);
        console.error("错误类型:", typeof err);
        console.error(
          "错误堆栈:",
          err instanceof Error ? err.stack : "无堆栈信息"
        );

        let userMessage = `API 请求失败: ${errorMessage}`;

        if (errorMessage.includes("Bad Request")) {
          userMessage = `API 服务器返回 Bad Request。请检查：\n1. Server URL 是否正确\n2. 用户名和密码是否正确\n3. API 服务器是否支持 Basic Auth`;
        } else if (errorMessage.includes("Unauthorized")) {
          userMessage = `认证失败。请检查用户名和密码是否正确。`;
        } else if (errorMessage.includes("not configured")) {
          userMessage = `配置不完整。请在设置中配置 Server URL、用户名和密码。`;
        }

        setError(userMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, []);

  if (loading) {
    return (
      <Box className={loadingContainer()}>
        <Box className={loadingContent()}>
          <Spinner size="large" />
          <Text className={loadingText()}>加载中...</Text>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={errorContainer()}>
        <Box className={errorCard()}>
          <Text className={errorTitle()}>
            ⚠️ 加载失败
          </Text>
          <Text className={errorMessage()}>
            {error}
          </Text>
        </Box>
      </Box>
    );
  }

  const renderFeedItem = ({ item }: { item: Feed }) => (
    <Box className={feedItem()}>
      <Box className={feedItemRow()}>
        <Box className={feedContent()}>
          <Text className={feedTitle()}>
            {item.title}
          </Text>
          {item.description && (
            <Text className={feedDescription()}>
              {item.description}
            </Text>
          )}
        </Box>
        {item.unread_count !== undefined && item.unread_count > 0 && (
          <Box className={unreadBadge()}>
            <Text className={unreadText()}>
              {item.unread_count}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box className="flex-1 bg-background-300 dark:bg-background-900">
      {/* 头部 */}
      <Box className="px-4 py-6 border-b border-outline-200 dark:border-outline-700 bg-background-0 dark:bg-background-800">
        <Box className="mb-2">
          <Text className="text-3xl font-bold text-text-900 dark:text-text-50">
            📰 订阅列表
          </Text>
        </Box>
        <Text className="text-sm text-text-500 dark:text-text-400">
          {feeds.length > 0 
            ? `共 ${feeds.length} 个订阅源` 
            : "还没有任何订阅"}
        </Text>
      </Box>

      {/* 内容 */}
      {feeds.length === 0 ? (
        <Box className="flex-1 justify-center items-center px-4">
          <Box className="items-center">
            <Text className="text-4xl mb-4">📭</Text>
            <Text className="text-lg font-semibold text-text-900 dark:text-text-50">
              暂无订阅源
            </Text>
            <Text className="text-sm text-text-500 dark:text-text-400 mt-2 text-center">
              在设置中添加 RSS 源以开始阅读
            </Text>
          </Box>
        </Box>
      ) : (
        <FlatList
          data={feeds}
          renderItem={renderFeedItem}
          keyExtractor={(item) => item.id}
          className="flex-1"
        />
      )}
    </Box>
  );
}
