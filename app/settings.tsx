import React from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { ScrollView } from "react-native";
import { SettingsOperations } from "@/db/settings";
import { Toast, useToast } from "@/components/ui/toast";
import { useThemeContext } from "@/components/ThemeContext";
import { useRouter } from "expo-router";
import { Settings } from "@/components/otter-ui/settings/components/settings";
import { useSettingsConfig } from "@/components/otter-ui/settings/useSettingsConfig";
import type { SettingsGroupConfig } from "@/components/otter-ui/settings/useSettingsConfig";

export default function SettingsPage() {
  const toast = useToast();
  const { setThemeSetting } = useThemeContext();
  const router = useRouter();
  // 设置配置
  const settingsConfig: SettingsGroupConfig[] = [
    {
      id: "server",
      title: "服务器",
      fields: [
        {
          id: "server-config",
          type: "navigation",
          label: "服务器配置",
          description: "配置 RSS 服务器地址和登录信息",
          route: "/settings/server-config",
        },
      ],
    },
    {
      id: "display",
      title: "显示",
      fields: [
        {
          id: "theme",
          type: "select",
          label: "主题模式",
          description: "选择应用的显示主题",
          defaultValue: "light",
          options: [
            { label: "浅色", value: "light" },
            { label: "深色", value: "dark" },
            { label: "跟随系统", value: "system" },
          ],
        },
        {
          id: "readingModeEnabled",
          type: "switch",
          label: "阅读模式",
          description: "沉浸式阅读体验",
          defaultValue: true,
        },
        {
          id: "feedsGroupedViewEnabled",
          type: "switch",
          label: "订阅源分组视图",
          description: "按分类分组显示订阅源",
          defaultValue: true,
        },
      ],
    },
    {
      id: "sync",
      title: "同步",
      fields: [
        {
          id: "refreshInterval",
          type: "number",
          label: "刷新间隔",
          description: "自动刷新 RSS 源的时间间隔（分钟）",
          placeholder: "30",
          defaultValue: 30,
          min: 5,
          max: 1440,
        },
        {
          id: "articlesPerPage",
          type: "number",
          label: "每页文章数",
          description: "每次加载显示的文章数量",
          placeholder: "20",
          defaultValue: 20,
          min: 10,
          max: 100,
        },
      ],
    },
    {
      id: "notifications",
      title: "通知",
      fields: [
        {
          id: "notificationsEnabled",
          type: "switch",
          label: "启用通知",
          description: "接收新文章通知",
          defaultValue: true,
        },
        {
          id: "soundNotificationEnabled",
          type: "switch",
          label: "声音",
          description: "新通知时播放提示音",
          defaultValue: true,
          disabled: (values) => !values.notificationsEnabled,
        },
        {
          id: "vibrationEnabled",
          type: "switch",
          label: "振动",
          description: "新通知时振动提醒",
          defaultValue: true,
          disabled: (values) => !values.notificationsEnabled,
        },
      ],
    },
    {
      id: "storage",
      title: "存储",
      fields: [
        {
          id: "offlineModeEnabled",
          type: "switch",
          label: "离线模式",
          description: "缓存文章以供离线阅读",
          defaultValue: true,
        },
        {
          id: "cacheItemLimit",
          type: "number",
          label: "缓存文章数量",
          description: "最多缓存的文章数量",
          placeholder: "1000",
          defaultValue: 1000,
          min: 100,
          max: 10000,
          disabled: (values) => !values.offlineModeEnabled,
        },
        {
          id: "compressionEnabled",
          type: "switch",
          label: "压缩存储",
          description: "压缩缓存数据节省空间",
          defaultValue: true,
          disabled: (values) => !values.offlineModeEnabled,
        },
      ],
    },
  ];

  const { settingsGroups, isLoading } = useSettingsConfig({
    groups: settingsConfig,
    onLoad: async () => {
      try {
        let userInfo = await SettingsOperations.getUserInfo();
        if (!userInfo) {
          console.log("设置不存在，初始化默认设置");
          await SettingsOperations.initializeSettings();
          userInfo = await SettingsOperations.getUserInfo();
        }

        const settings = await SettingsOperations.getSettings();
        return {
          theme: settings?.theme || "light",
          readingModeEnabled: settings?.readingModeEnabled ?? true,
          feedsGroupedViewEnabled: settings?.feedsGroupedViewEnabled ?? true,
          refreshInterval: settings?.refreshInterval ?? 30,
          articlesPerPage: settings?.articlesPerPage ?? 20,
          notificationsEnabled: settings?.notificationsEnabled ?? true,
          soundNotificationEnabled: settings?.soundNotificationEnabled ?? true,
          vibrationEnabled: settings?.vibrationEnabled ?? true,
          offlineModeEnabled: settings?.offlineModeEnabled ?? true,
          cacheItemLimit: settings?.cacheItemLimit ?? 1000,
          compressionEnabled: settings?.compressionEnabled ?? true,
        };
      } catch (error) {
        console.error("加载设置失败:", error);
        if (
          error instanceof Error &&
          !error.message.includes("Database not initialized")
        ) {
          toast.show({
            placement: "top",
            duration: 3000,
            render: ({ id }: { id: string }) => (
              <Toast nativeID={`toast-${id}`} action="error" variant="solid">
                <Text>加载设置失败</Text>
              </Toast>
            ),
          });
        }
        return {};
      }
    },
    onSave: async (values) => {
      try {
        // 保存设置
        await SettingsOperations.updateSettings({
          refreshInterval: values.refreshInterval,
          articlesPerPage: values.articlesPerPage,
          notificationsEnabled: values.notificationsEnabled,
          soundNotificationEnabled: values.soundNotificationEnabled,
          vibrationEnabled: values.vibrationEnabled,
          offlineModeEnabled: values.offlineModeEnabled,
          cacheItemLimit: values.cacheItemLimit,
          compressionEnabled: values.compressionEnabled,
          readingModeEnabled: values.readingModeEnabled,
          feedsGroupedViewEnabled: values.feedsGroupedViewEnabled,
        });
      } catch (error) {
        console.error("保存设置失败:", error);
      }
    },
    customHandlers: {
      theme: async (value: string) => {
        try {
          await setThemeSetting(value as "light" | "dark" | "system");
          toast.show({
            placement: "top",
            duration: 2000,
            render: ({ id }: { id: string }) => (
              <Toast nativeID={`toast-${id}`} action="success" variant="solid">
                <Text>主题已切换</Text>
              </Toast>
            ),
          });
        } catch (error) {
          console.error("切换主题失败:", error);
          toast.show({
            placement: "top",
            duration: 2000,
            render: ({ id }: { id: string }) => (
              <Toast nativeID={`toast-${id}`} action="error" variant="solid">
                <Text>切换主题失败</Text>
              </Toast>
            ),
          });
        }
      },
      "server-config": (route: string) => {
        router.push(route);
      },
    },
  });

  if (isLoading) {
    return (
      <Box className="flex-1 bg-background-50 justify-center items-center">
        <Text className="text-lg text-typography-500">加载中...</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text className="text-2xl font-bold mb-6">设置</Text>
        <Settings groups={settingsGroups} />
      </ScrollView>
    </Box>
  );
}
