import React, { useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import { PanResponder, View } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Spinner } from "@/components/ui/spinner";
import {
  ArticleReader,
  ArticleItem,
} from "@/components/otter-ui/article-reader";
import { useCachedItem } from "@/hooks/useCache";
import { tv } from "tailwind-variants";

// ========== 样式定义 ==========

const container = tv({
  base: "flex-1 bg-background-0 dark:bg-background-800",
});

const loadingContainer = tv({
  base: "flex-1 bg-background-0 dark:bg-background-800 flex justify-center items-center",
});

// ========== 组件 ==========

export default function ReaderPage() {
  const params = useLocalSearchParams<{
    itemId?: string;
  }>();

  const itemId = params.itemId;

  if (!itemId) {
    return (
      <Box className={loadingContainer()}>
        <VStack className="items-center">
          <Text className="text-error-600 dark:text-error-300 text-lg font-bold">
            文章 ID 未提供
          </Text>
        </VStack>
      </Box>
    );
  }

  const { item, loading, error, refresh } = useCachedItem({ id: itemId });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        // 保留手势支持，后续可扩展
      },
    })
  ).current;

  if (loading) {
    return (
      <Box className={loadingContainer()}>
        <VStack className="items-center">
          <Spinner size="large" />
          <Text className="text-typography-600 dark:text-typography-300 mt-4">
            加载文章中...
          </Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={loadingContainer()}>
        <VStack className="items-center">
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
      <Box className={loadingContainer()}>
        <VStack className="items-center">
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
    <View className={container()} {...panResponder.panHandlers}>
      <ArticleReader articles={articles} currentIndex={0} />
    </View>
  );
}
