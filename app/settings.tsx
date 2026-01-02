import React, { useEffect, useState, useMemo } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { ScrollView } from "react-native";
import { SettingsOperations } from "@/db/settings";
import { Toast, useToast } from "@/components/ui/toast";
import { useThemeContext } from "@/components/ThemeContext";
import { Settings } from "@/components/otter-ui/settings/components/settings";
import type { SettingsGroup } from "@/components/otter-ui/settings/types";

export default function SettingsPage() {
  // 状态管理
  const [baseUrl, setBaseUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [articlesPerPage, setArticlesPerPage] = useState<number>(20);
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(true);
  const [soundNotificationEnabled, setSoundNotificationEnabled] =
    useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState<boolean>(true);
  const [cacheItemLimit, setCacheItemLimit] = useState<number>(1000);
  const [compressionEnabled, setCompressionEnabled] = useState<boolean>(true);
  const [readingModeEnabled, setReadingModeEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const { setThemeSetting } = useThemeContext();

  // 自动加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        let userInfo = await SettingsOperations.getUserInfo();

        // 如果设置不存在，先初始化
        if (!userInfo) {
          console.log("设置不存在，初始化默认设置");
          await SettingsOperations.initializeSettings();
          userInfo = await SettingsOperations.getUserInfo();
        }

        if (userInfo) {
          setBaseUrl(userInfo.baseUrl || "");
          setUsername(userInfo.username || "");
          setPassword(userInfo.password || "");
        }

        const settings = await SettingsOperations.getSettings();
        if (settings) {
          setTheme((settings.theme as "light" | "dark" | "system") ?? "light");
          setRefreshInterval(settings.refreshInterval ?? 30);
          setArticlesPerPage(settings.articlesPerPage ?? 20);
          setNotificationsEnabled(settings.notificationsEnabled ?? true);
          setSoundNotificationEnabled(
            settings.soundNotificationEnabled ?? true
          );
          setVibrationEnabled(settings.vibrationEnabled ?? true);
          setOfflineModeEnabled(settings.offlineModeEnabled ?? true);
          setCacheItemLimit(settings.cacheItemLimit ?? 1000);
          setCompressionEnabled(settings.compressionEnabled ?? true);
          setReadingModeEnabled(settings.readingModeEnabled ?? true);
        }
      } catch (error) {
        console.error("加载设置失败:", error);
        // 只在有网络错误时显示 toast
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
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 保存设置
  const handleSave = async () => {
    try {
      if (!baseUrl.trim()) {
        toast.show({
          placement: "top",
          duration: 3000,
          render: ({ id }: { id: string }) => (
            <Toast nativeID={`toast-${id}`} action="warning" variant="solid">
              <Text>请输入服务器地址</Text>
            </Toast>
          ),
        });
        return;
      }

      if (!username.trim()) {
        toast.show({
          placement: "top",
          duration: 3000,
          render: ({ id }: { id: string }) => (
            <Toast nativeID={`toast-${id}`} action="warning" variant="solid">
              <Text>请输入用户名</Text>
            </Toast>
          ),
        });
        return;
      }

      if (!password.trim()) {
        toast.show({
          placement: "top",
          duration: 3000,
          render: ({ id }: { id: string }) => (
            <Toast nativeID={`toast-${id}`} action="warning" variant="solid">
              <Text>请输入密码</Text>
            </Toast>
          ),
        });
        return;
      }

      setIsSaving(true);
      // 保存用户信息
      await SettingsOperations.setUserInfo(baseUrl, username, password);
      // 保存其他设置
      await SettingsOperations.updateSettings({
        refreshInterval,
        articlesPerPage,
        notificationsEnabled,
        soundNotificationEnabled,
        vibrationEnabled,
        offlineModeEnabled,
        cacheItemLimit,
        compressionEnabled,
        readingModeEnabled,
      });

      toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }: { id: string }) => (
          <Toast nativeID={`toast-${id}`} action="success" variant="solid">
            <Text>设置保存成功</Text>
          </Toast>
        ),
      });
    } catch (error) {
      console.error("保存设置失败:", error);
      toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }: { id: string }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <Text>保存设置失败</Text>
          </Toast>
        ),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 处理主题改变
  const handleThemeChange = async (value: string) => {
    const newTheme = value as "light" | "dark" | "system";
    setTheme(newTheme);
    try {
      await setThemeSetting(newTheme);
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
  };

  // Settings 配置
  const settingsConfig: SettingsGroup[] = useMemo(
    () => [
      {
        id: "display",
        title: "显示设置",
        items: [
          {
            type: "select",
            id: "theme",
            label: "主题模式",
            description: "选择应用的显示主题",
            value: theme,
            options: [
              { label: "浅色", value: "light" },
              { label: "深色", value: "dark" },
              { label: "跟随系统", value: "system" },
            ],
            onChange: handleThemeChange,
            disabled: isSaving,
          },
          {
            type: "switch",
            id: "reading-mode",
            label: "阅读模式",
            description: "开启后使用更适合阅读的排版和样式",
            value: readingModeEnabled,
            onChange: setReadingModeEnabled,
            disabled: isSaving,
          },
        ],
      },
      {
        id: "server",
        title: "服务器配置",
        items: [
          {
            type: "input",
            id: "base-url",
            label: "服务器地址 (URL)",
            description: "输入 RSS 服务器的地址",
            value: baseUrl,
            placeholder: "例如: https://api.example.com/api/greader.php",
            inputType: "url",
            onChange: setBaseUrl,
            disabled: isSaving,
          },
          {
            type: "input",
            id: "username",
            label: "用户名",
            description: "服务器登录用户名",
            value: username,
            placeholder: "输入用户名",
            inputType: "text",
            onChange: setUsername,
            disabled: isSaving,
          },
          {
            type: "input",
            id: "password",
            label: "密码",
            description: "服务器登录密码",
            value: password,
            placeholder: "输入密码",
            inputType: "password",
            onChange: setPassword,
            disabled: isSaving,
          },
          {
            type: "button",
            id: "save-button",
            buttonText: isSaving ? "保存中..." : "保存设置",
            variant: "primary",
            onPress: handleSave,
            disabled: isSaving,
          },
        ],
      },
      {
        id: "sync",
        title: "同步设置",
        items: [
          {
            type: "number",
            id: "refresh-interval",
            label: "刷新间隔（分钟）",
            description: "自动刷新 RSS 源的时间间隔",
            value: refreshInterval,
            placeholder: "30",
            min: 5,
            max: 1440,
            onChange: setRefreshInterval,
            disabled: isSaving,
          },
          {
            type: "number",
            id: "articles-per-page",
            label: "每页文章数",
            description: "每次加载显示的文章数量",
            value: articlesPerPage,
            placeholder: "20",
            min: 10,
            max: 100,
            onChange: setArticlesPerPage,
            disabled: isSaving,
          },
        ],
      },
      {
        id: "notifications",
        title: "通知设置",
        items: [
          {
            type: "switch",
            id: "notifications-enabled",
            label: "启用通知",
            description: "接收新文章通知",
            value: notificationsEnabled,
            onChange: setNotificationsEnabled,
            disabled: isSaving,
          },
          {
            type: "switch",
            id: "sound-notification",
            label: "声音通知",
            description: "新通知时播放提示音",
            value: soundNotificationEnabled,
            onChange: setSoundNotificationEnabled,
            disabled: isSaving || !notificationsEnabled,
          },
          {
            type: "switch",
            id: "vibration",
            label: "振动",
            description: "新通知时振动提醒",
            value: vibrationEnabled,
            onChange: setVibrationEnabled,
            disabled: isSaving || !notificationsEnabled,
          },
        ],
      },
      {
        id: "storage",
        title: "存储设置",
        items: [
          {
            type: "switch",
            id: "offline-mode",
            label: "离线模式",
            description: "缓存文章以供离线阅读",
            value: offlineModeEnabled,
            onChange: setOfflineModeEnabled,
            disabled: isSaving,
          },
          {
            type: "number",
            id: "cache-limit",
            label: "缓存文章数量",
            description: "最多缓存的文章数量",
            value: cacheItemLimit,
            placeholder: "1000",
            min: 100,
            max: 10000,
            onChange: setCacheItemLimit,
            disabled: isSaving || !offlineModeEnabled,
          },
          {
            type: "switch",
            id: "compression",
            label: "压缩存储",
            description: "压缩缓存数据以节省空间",
            value: compressionEnabled,
            onChange: setCompressionEnabled,
            disabled: isSaving || !offlineModeEnabled,
          },
        ],
      },
    ],
    [
      theme,
      readingModeEnabled,
      baseUrl,
      username,
      password,
      refreshInterval,
      articlesPerPage,
      notificationsEnabled,
      soundNotificationEnabled,
      vibrationEnabled,
      offlineModeEnabled,
      cacheItemLimit,
      compressionEnabled,
      isSaving,
    ]
  );

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
        <Text className="text-2xl font-bold mb-4">设置</Text>
        <Settings groups={settingsConfig} />
      </ScrollView>
    </Box>
  );
}
