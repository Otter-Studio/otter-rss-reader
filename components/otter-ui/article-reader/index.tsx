import React, { useMemo } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import RenderHTML from "react-native-render-html";
import { useWindowDimensions, ScrollView, useColorScheme } from "react-native";

const container = tva({
  base: "flex-1 bg-background-0 dark:bg-background-800 flex flex-col",
});

const header = tva({
  base: "px-4 py-4 border-b border-outline-200 dark:border-outline-700 bg-background-100 dark:bg-background-900",
});

const headerTitle = tva({
  base: "text-xl font-bold text-typography-900 dark:text-typography-0 line-clamp-2",
});

const headerSubtitle = tva({
  base: "text-sm text-typography-500 dark:text-typography-400 mt-2",
});
const contentContainer = tva({
  base: "flex-1 bg-background-0 dark:bg-background-800",
});
const content = tva({
  base: "flex-1 px-4 py-4",
});

const contentText = tva({
  base: "text-base text-typography-800 dark:text-typography-100 leading-relaxed whitespace-pre-wrap",
});

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
}: ArticleReaderProps) => {
  const currentArticle = useMemo(() => {
    return articles[currentIndex] || null;
  }, [articles, currentIndex]);

  const type = useMemo(() => {
    if (!currentArticle || !currentArticle.summary) return "text";
    const content = currentArticle.summary.content;
    return /<\/?[a-z][\s\S]*>/i.test(content) ? "html" : "text";
  }, [currentArticle]);

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
    <Box className={container({})}>
      {/* 头部 */}
      <Box className={header({})}>
        <Text className={headerTitle({})}>{currentArticle.title}</Text>
        <HStack className="mt-3 justify-between items-center">
          <Text className={headerSubtitle({})}>
            {currentArticle.origin?.title || "未知来源"}
          </Text>
          <Text className="text-xs text-typography-500 dark:text-typography-400">
            {publishedTime}
          </Text>
        </HStack>
        {currentArticle.author && (
          <Text className="text-xs text-typography-500 dark:text-typography-400 mt-2">
            {currentArticle.author}
          </Text>
        )}
      </Box>

      {/* 内容 */}
      <Box className={contentContainer({})}>
        <ScrollView
          className={content({})}
          showsVerticalScrollIndicator
          nestedScrollEnabled={true}
          scrollEnabled={true}
        >
          {ReaderMap[type](contentHTML)}
        </ScrollView>
      </Box>
    </Box>
  );
};

const ReaderMap = {
  text: (content: string) => <Text className={contentText({})}>{content}</Text>,
  html: (content: string) => {
    const { width } = useWindowDimensions();

    return (
      <RenderHTML
        contentWidth={width - 32} // 减去左右 padding
        source={{ html: content }}
        systemFonts={[
          "SF Pro Text",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ]}
        defaultTextProps={{
          selectable: true,
        }}
        renderersProps={{
          img: {
            enableExperimentalPercentWidth: true,
          },
        }}
      />
    );
  },
};

export default ArticleReader;
