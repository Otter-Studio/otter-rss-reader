import React, { useMemo } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import RenderHTML from "react-native-render-html";
import { useWindowDimensions, ScrollView } from "react-native";
import {
  container,
  header,
  headerTitle,
  headerTime,
  contentContainer,
  content,
  info,
  infoTitle,
  infoSubtitle,
  footer,
  contentText,
  tagsStyles,
} from "./style";

export interface ArticleItem {
  id: string;
  title: string;
  summary?: {
    content: string;
  };
  author?: string;
  published?: number;
  htmlUrl?: string;
  origin?: {
    title: string;
    htmlUrl?: string;
    streamId: string;
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

  const contentHTML = currentArticle?.summary?.content || "无内容";
  const publishedTime = currentArticle?.published
    ? new Date(currentArticle.published * 1000).toLocaleDateString("zh-CN")
    : "未知日期";

  // 没有文章时显示空状态
  if (!currentArticle) {
    return (
      <Box className={container()}>
        <VStack className="flex-1 justify-center items-center px-4">
          <Text className="text-lg font-bold text-typography-600">
            没有文章
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className={container({})}>
      {/* 头部 */}
      <Box className={header({})}>
        <Text className={headerTitle({})}>{currentArticle.title}</Text>
        <Text className={headerTime({})}>{publishedTime}</Text>
      </Box>

      {/* 内容 */}
      <Box className={contentContainer({})}>
        <ScrollView
          className={content({})}
          showsVerticalScrollIndicator
          nestedScrollEnabled={true}
          scrollEnabled={true}
        >
          {/* 基本信息 */}
          <Box className={info({})}>
            <HStack className="justify-between items-start">
              <VStack className="flex-1">
                <Text className={infoTitle({})}>{currentArticle.title}</Text>
                <HStack className="mt-3 justify-between items-center">
                  <Text className={infoSubtitle({})}>
                    {currentArticle.origin?.title || "未知来源"}
                  </Text>
                  <Text className="text-xs text-typography-500">
                    {publishedTime}
                  </Text>
                </HStack>
                {currentArticle.author && (
                  <Text className="text-xs text-typography-500">
                    @{currentArticle.author}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Box>
          {ReaderMap[type](contentHTML)}
          <Box className={footer({})} />
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
        tagsStyles={tagsStyles}
      />
    );
  },
};

export default ArticleReader;
