import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import RenderHTML from "react-native-render-html";
import { useWindowDimensions, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import { SettingsOperations } from "@/db/settings";
import WebView from "react-native-webview";

const container = tva({
  base: "flex-1 bg-background-0 dark:bg-background-800 flex flex-col",
});

const header = tva({
  base: "px-4 py-1 bg-background-50 flex justify-between items-center flex-row",
});

const headerTitle = tva({
  base: "text-sm text-typography-500 flex-1 mr-2 line-clamp-1",
});

const headerTime = tva({
  base: "text-sm text-typography-500 shrink-0",
});

const info = tva({
  base: "px-4 py-4 border-b border-outline-50 bg-background-50 rounded-md mb-2",
});

const infoTitle = tva({
  base: "text-xl font-bold text-typography-900",
});

const infoSubtitle = tva({
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

const footer = tva({
  base: "w-full h-24",
});

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
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDoubleTap, setIsDoubleTap] = useState(false);

  const handleDoubleTap = useCallback(() => {
    setIsDoubleTap(true);
    setTimeout(() => setIsDoubleTap(false), 300);
  }, []);

  // 加载沉浸式阅读设置
  const loadReadingMode = useCallback(async () => {
    try {
      const settings = await SettingsOperations.getSettings();
      setIsImmersiveMode(settings.readingModeEnabled ?? true);
      console.log(
        "[ArticleReader] Loaded reading mode:",
        settings.readingModeEnabled
      );
    } catch (error) {
      console.error("加载沉浸式阅读设置失败:", error);
    }
  }, []);

  // 在组件挂载时加载
  useEffect(() => {
    loadReadingMode();
  }, [loadReadingMode]);

  // 在组件获得焦点时重新加载设置（解决切换页面后返回的问题）
  useFocusEffect(
    useCallback(() => {
      console.log("[ArticleReader] Component focused, reloading settings");
      // 清除缓存以获取最新的数据库值
      SettingsOperations.clearCache();
      loadReadingMode();
    }, [loadReadingMode])
  );

  // 处理沉浸式阅读切换
  const handleImmersiveToggle = async (value: boolean) => {
    try {
      setIsSaving(true);
      setIsImmersiveMode(value);
      console.log("[ArticleReader] Saving reading mode:", value);
      // 保存设置到数据库
      await SettingsOperations.updateSettings({
        readingModeEnabled: value,
      });
      console.log("[ArticleReader] Reading mode saved successfully");
    } catch (error) {
      console.error("保存沉浸式阅读设置失败:", error);
      // 恢复状态
      setIsImmersiveMode(!value);
    } finally {
      setIsSaving(false);
    }
  };

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
          <Text className="text-lg font-bold text-typography-600 dark:text-typography-300">
            没有文章
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className={container({})} onTouchStart={handleDoubleTap}>
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
                  <Text className="text-xs text-typography-500 dark:text-typography-400">
                    {publishedTime}
                  </Text>
                </HStack>
                {currentArticle.author && (
                  <Text className="text-xs text-typography-500 dark:text-typography-400 mt-2">
                    @{currentArticle.author}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Box>
          {isDoubleTap &&
          (currentArticle.htmlUrl || currentArticle.origin?.htmlUrl) ? (
            <WebView
              source={{
                uri:
                  currentArticle.htmlUrl ||
                  currentArticle.origin?.htmlUrl ||
                  "",
              }}
            />
          ) : (
            ReaderMap[type](contentHTML)
          )}
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
      />
    );
  },
};

export default ArticleReader;
