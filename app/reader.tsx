import React, { useEffect, useState, useRef } from "react";
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
import { getReader } from "@/api";
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
  const params = useLocalSearchParams<{ feedId?: string; feedTitle?: string }>();

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        // 上滑切换到下一篇
        if (gestureState.dy < -50 && currentIndex < articles.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
        // 下滑切换到上一篇
        if (gestureState.dy > 50 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      },
    })
  ).current;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

  const feedId = params.feedId;
        if (!feedId) {
          setError("Feed ID 未提供");
          setLoading(false);
          return;
        }

        const reader = await getReader();
        const items = await reader.getItems(feedId, { num: 50 });

        setArticles(items || []);
        // 随机显示一篇文章
        if (items && items.length > 0) {
          const randomIndex = Math.floor(Math.random() * items.length);
          setCurrentIndex(randomIndex);
        } else {
          setCurrentIndex(0);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "获取文章失败";
        console.error("获取文章出错:", err);
        setError(`获取文章失败: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [params.feedId]);

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
      <Box className={container()}>
        <VStack className="flex-1 justify-center items-center px-4">
          <Text className="text-lg font-bold text-error-600 dark:text-error-300">
            {error}
          </Text>
        </VStack>
      </Box>
    );
  }

  const handleRandomArticle = () => {
    if (articles.length > 0) {
      const randomIndex = Math.floor(Math.random() * articles.length);
      console.log("Random article:", randomIndex, articles[randomIndex]?.title);
      setCurrentIndex(randomIndex);
    }
  };

  return (
    <View className={container()} {...panResponder.panHandlers}>
      <ArticleReader
        articles={articles}
        currentIndex={currentIndex}
        onPreviousPress={() => {
          console.log("Previous pressed, current index:", currentIndex);
          currentIndex > 0 && setCurrentIndex(currentIndex - 1);
        }}
        onNextPress={() => {
          console.log("Next pressed, current index:", currentIndex);
          currentIndex < articles.length - 1 &&
            setCurrentIndex(currentIndex + 1);
        }}
        onRandomPress={handleRandomArticle}
      />
    </View>
  );
}
