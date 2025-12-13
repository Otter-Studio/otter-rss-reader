import React, { useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import { PanResponder, View } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  ArticleReader,
  ArticleItem,
} from "@/components/otter-ui/article-reader";
import { LoadingBar } from "@/components/otter-ui/loading-bar";
import { useCachedItem } from "@/hooks/useCache";
import { tv } from "tailwind-variants";

// ========== 样式定义 ==========

const container = tv({
  base: "flex-1 bg-background-0 dark:bg-background-800",
});

// ========== 组件 ==========

export default function ReaderPage() {
  const params = useLocalSearchParams<{
    itemId?: string;
  }>();

  const itemId = params.itemId;

  if (!itemId) {
    return (
      <Box className={container()}>
        <VStack className="flex-1 items-center justify-center">
          <Text className="text-error-600 dark:text-error-300 text-lg font-bold">
            文章 ID 未提供
          </Text>
        </VStack>
      </Box>
    );
  }

  const { item, loading, error, refresh } = useCachedItem({ id: itemId });

  if (loading) {
    return (
      <View className={container()}>
        <LoadingBar isLoading={true} />
        <VStack className="flex-1 items-center justify-center">
          <Text className="text-typography-600 dark:text-typography-300">
            加载文章中...
          </Text>
        </VStack>
      </View>
    );
  }

  if (error) {
    return (
      <Box className={container()}>
        <LoadingBar isLoading={false} />
        <VStack className="flex-1 items-center justify-center px-4">
          <Text className="text-lg font-bold text-error-600 dark:text-error-300">
            ⚠️ 加载失败
          </Text>
          <Text className="text-sm text-error-500 dark:text-error-400 mt-2">
            {error.message}
          </Text>
        </VStack>
      </Box>
    );
  }

  if (!item) {
    return (
      <Box className={container()}>
        <LoadingBar isLoading={false} />
        <VStack className="flex-1 items-center justify-center">
          <Text className="text-lg font-bold text-typography-600 dark:text-typography-300">
            找不到文章
          </Text>
        </VStack>
      </Box>
    );
  }

  // 将单个 item 转换为 ArticleItem 数组格式
  const articles: ArticleItem[] = [
    {
      id: item.id,
      title: item.title,
      summary: item.summary,
      published: item.published,
      author: item.author,
      origin: item.origin,
    },
  ];

  return (
    <View className={container()}>
      <ArticleReader articles={articles} currentIndex={0} />
    </View>
  );
}
