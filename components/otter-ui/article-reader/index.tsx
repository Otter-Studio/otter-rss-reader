import React, { useMemo } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Pressable } from "@/components/ui/pressable";
import { tv } from "tailwind-variants";

// ========== 样式定义 ==========

const container = tv({
  base: "flex-1 bg-background-0 dark:bg-background-800 flex flex-col",
});

const header = tv({
  base: "px-4 py-4 border-b border-outline-200 dark:border-outline-700 bg-background-100 dark:bg-background-900",
});

const headerTitle = tv({
  base: "text-xl font-bold text-typography-900 dark:text-typography-0 line-clamp-2",
});

const headerSubtitle = tv({
  base: "text-sm text-typography-500 dark:text-typography-400 mt-2",
});

const content = tv({
  base: "flex-1 px-4 py-4",
});

const contentText = tv({
  base: "text-base text-typography-800 dark:text-typography-100 leading-relaxed whitespace-pre-wrap",
});

const footer = tv({
  base: "px-4 py-4 border-t border-outline-200 dark:border-outline-700 flex flex-row justify-between items-center bg-background-100 dark:bg-background-900",
});

const counter = tv({
  base: "text-sm text-typography-600 dark:text-typography-300",
});

const button = tv({
  base: "px-4 py-2 rounded-lg bg-primary-500 dark:bg-primary-600 active:bg-primary-600 dark:active:bg-primary-700",
});

const buttonText = tv({
  base: "text-sm font-semibold text-typography-0 dark:text-typography-900",
});

const buttonDisabled = tv({
  base: "px-4 py-2 rounded-lg bg-outline-300 dark:bg-outline-600 opacity-50",
});

// ========== 组件 ==========

export interface ArticleItem {
  id: string;
  title: string;
  summary?: {
    content: string;
  };
  author?: string;
  published?: number;
  origin?: {
    title: string;
  };
}

export interface ArticleReaderProps {
  articles: ArticleItem[];
  currentIndex: number;
  onPreviousPress?: () => void;
  onNextPress?: () => void;
  onRandomPress?: () => void;
}

export const ArticleReader = ({
  articles,
  currentIndex,
  onPreviousPress,
  onNextPress,
  onRandomPress,
}: ArticleReaderProps) => {
  const currentArticle = useMemo(() => {
    return articles[currentIndex] || null;
  }, [articles, currentIndex]);

  if (!currentArticle) {
    return (
      <Box className={container()}>
        <VStack className="flex-1 justify-center items-center px-4">
          <Text className="text-lg font-bold text-typography-600 dark:text-typography-300">
            没有文章
          </Text>
        </VStack>
      </Box>
    );
  }

  const contentHTML = currentArticle.summary?.content || "无内容";
  const publishedTime = currentArticle.published
    ? new Date(currentArticle.published * 1000).toLocaleDateString("zh-CN")
    : "未知日期";

  return (
    <Box className={container()}>
      {/* 头部 */}
      <Box className={header()}>
        <Text className={headerTitle()}>{currentArticle.title}</Text>
        <HStack className="mt-3 justify-between items-center">
          <Text className={headerSubtitle()}>
            {currentArticle.origin?.title || "未知来源"}
          </Text>
          <Text className="text-xs text-typography-500 dark:text-typography-400">
            {publishedTime}
          </Text>
        </HStack>
        {currentArticle.author && (
          <Text className="text-xs text-typography-500 dark:text-typography-400 mt-2">
            作者: {currentArticle.author}
          </Text>
        )}
      </Box>

      {/* 内容 */}
      <ScrollView className={content()}>
        <Text className={contentText()}>{contentHTML}</Text>
      </ScrollView>

      {/* 底部导航和计数 */}
      <Box className={footer()}>
        <Pressable
          onPress={() => {
            console.log("Previous button pressed, disabled:", currentIndex === 0);
            if (currentIndex > 0) {
              onPreviousPress?.();
            }
          }}
          disabled={currentIndex === 0}
        >
          <Box className={currentIndex === 0 ? buttonDisabled() : button()}>
            <Text className={buttonText()}>上一篇</Text>
          </Box>
        </Pressable>

        <Pressable
          onPress={() => {
            console.log("Random button pressed");
            onRandomPress?.();
          }}
        >
          <Box className={button()}>
            <Text className={buttonText()}>🎲</Text>
          </Box>
        </Pressable>

        <Text className={counter()}>
          {currentIndex + 1} / {articles.length}
        </Text>

        <Pressable
          onPress={() => {
            console.log("Next button pressed, disabled:", currentIndex === articles.length - 1);
            if (currentIndex < articles.length - 1) {
              onNextPress?.();
            }
          }}
          disabled={currentIndex === articles.length - 1}
        >
          <Box
            className={
              currentIndex === articles.length - 1 ? buttonDisabled() : button()
            }
          >
            <Text className={buttonText()}>下一篇</Text>
          </Box>
        </Pressable>
      </Box>
    </Box>
  );
};

export default ArticleReader;
