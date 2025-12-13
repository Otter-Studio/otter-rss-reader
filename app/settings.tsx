import React, { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ScrollView } from "react-native";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui/form-control";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from "@/components/ui/select";
import { SettingsOperations } from "@/db/settings";
import { Toast, useToast } from "@/components/ui/toast";
import { useThemeContext } from "@/components/ThemeContext";
import { HStack } from "@/components/ui/hstack";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
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
          setTheme(settings.theme);
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
  }, [toast]);

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

  if (isLoading) {
    return (
      <Box className="flex-1 bg-background-300 justify-center items-center">
        <Text className="text-lg text-typography-500">加载中...</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-300">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <VStack className="space-y-8">
          <Text className="text-2xl font-bold mb-2">设置</Text>

          {/* 主题设置区域 */}
          <VStack className="space-y-4 bg-background-0 rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-typography-800">
              显示设置
            </Text>

            {/* 主题选择 */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>主题模式</FormControlLabelText>
              </FormControlLabel>
              <Select
                selectedValue={theme}
                onValueChange={handleThemeChange}
                isDisabled={isSaving}
              >
                <SelectTrigger>
                  <SelectInput placeholder="选择主题模式" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <SelectItem label="浅色" value="light" />
                    <SelectItem label="深色" value="dark" />
                    <SelectItem label="跟随系统" value="system" />
                  </SelectContent>
                </SelectPortal>
              </Select>
              <FormControlHelper>
                <FormControlHelperText>
                  选择应用的显示主题
                </FormControlHelperText>
              </FormControlHelper>
            </FormControl>

            {/* 阅读模式 */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>阅读模式</FormControlLabelText>
              </FormControlLabel>
              <HStack className="items-center justify-between">
                <Text className="text-typography-600">启用沉浸式阅读</Text>
                <Switch
                  value={readingModeEnabled}
                  onValueChange={setReadingModeEnabled}
                  isDisabled={isSaving}
                />
              </HStack>
              <FormControlHelper>
                <FormControlHelperText>
                  开启后使用更适合阅读的排版和样式
                </FormControlHelperText>
              </FormControlHelper>
            </FormControl>
          </VStack>

          {/* 服务器设置区域 */}
          <VStack className="space-y-4 bg-background-0 rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-typography-800">
              服务器配置
            </Text>

            {/* 服务器地址 */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>服务器地址 (URL)</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="例如: https://api.example.com"
                  value={baseUrl}
                  onChangeText={setBaseUrl}
                  editable={!isSaving}
                  type="text"
                />
              </Input>
              <FormControlHelper>
                <FormControlHelperText>
                  输入 RSS 服务器的地址
                </FormControlHelperText>
              </FormControlHelper>
            </FormControl>

            {/* 用户名 */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>用户名</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="输入用户名"
                  value={username}
                  onChangeText={setUsername}
                  editable={!isSaving}
                  type="text"
                />
              </Input>
              <FormControlHelper>
                <FormControlHelperText>服务器登录用户名</FormControlHelperText>
              </FormControlHelper>
            </FormControl>

            {/* 密码 */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>密码</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="输入密码"
                  value={password}
                  onChangeText={setPassword}
                  editable={!isSaving}
                  type="password"
                />
              </Input>
              <FormControlHelper>
                <FormControlHelperText>服务器登录密码</FormControlHelperText>
              </FormControlHelper>
            </FormControl>

            {/* 按钮区域 */}
            <VStack className="space-y-2 pt-4">
              <Button
                onPress={handleSave}
                disabled={isSaving}
                className="bg-primary-600 active:bg-primary-700"
              >
                <ButtonText>{isSaving ? "保存中..." : "保存设置"}</ButtonText>
              </Button>
            </VStack>
          </VStack>

          {/* 同步与缓存设置 */}
          <VStack className="space-y-4 bg-background-0 rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-typography-800">
              同步与缓存
            </Text>

            {/* 刷新间隔 */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>刷新间隔（秒）</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="例如: 30"
                  value={String(refreshInterval)}
                  onChangeText={(t) => {
                    const n = parseInt(t || "0", 10);
                    if (!Number.isNaN(n)) setRefreshInterval(n);
                  }}
                  editable={!isSaving}
                  type="text"
                />
              </Input>
              <FormControlHelper>
                <FormControlHelperText>
                  自动同步的时间间隔，过小会增加耗电与网络请求
                </FormControlHelperText>
              </FormControlHelper>
            </FormControl>

            {/* 每页文章数 */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>每页文章数</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="例如: 20"
                  value={String(articlesPerPage)}
                  onChangeText={(t) => {
                    const n = parseInt(t || "0", 10);
                    if (!Number.isNaN(n)) setArticlesPerPage(n);
                  }}
                  editable={!isSaving}
                  type="text"
                />
              </Input>
              <FormControlHelper>
                <FormControlHelperText>
                  列表分页大小，过大可能影响性能
                </FormControlHelperText>
              </FormControlHelper>
            </FormControl>

            {/* 缓存上限 */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>缓存条目上限</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="例如: 1000"
                  value={String(cacheItemLimit)}
                  onChangeText={(t) => {
                    const n = parseInt(t || "0", 10);
                    if (!Number.isNaN(n)) setCacheItemLimit(n);
                  }}
                  editable={!isSaving}
                  type="text"
                />
              </Input>
              <FormControlHelper>
                <FormControlHelperText>
                  本地缓存的最大条目数量
                </FormControlHelperText>
              </FormControlHelper>
            </FormControl>

            {/* 离线模式 */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>离线模式</FormControlLabelText>
              </FormControlLabel>
              <HStack className="items-center justify-between">
                <Text className="text-typography-600">启用离线缓存与阅读</Text>
                <Switch
                  value={offlineModeEnabled}
                  onValueChange={setOfflineModeEnabled}
                  isDisabled={isSaving}
                />
              </HStack>
            </FormControl>

            {/* 压缩缓存 */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>压缩缓存</FormControlLabelText>
              </FormControlLabel>
              <HStack className="items-center justify-between">
                <Text className="text-typography-600">减少存储占用</Text>
                <Switch
                  value={compressionEnabled}
                  onValueChange={setCompressionEnabled}
                  isDisabled={isSaving}
                />
              </HStack>
            </FormControl>
          </VStack>

          {/* 通知设置 */}
          <VStack className="space-y-4 bg-background-0 rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-typography-800">
              通知设置
            </Text>

            {/* 总开关 */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>启用通知</FormControlLabelText>
              </FormControlLabel>
              <HStack className="items-center justify-between">
                <Text className="text-typography-600">新文章提醒</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  isDisabled={isSaving}
                />
              </HStack>
            </FormControl>

            {/* 声音提醒 */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>声音提醒</FormControlLabelText>
              </FormControlLabel>
              <HStack className="items-center justify-between">
                <Text className="text-typography-600">收到通知时播放音效</Text>
                <Switch
                  value={soundNotificationEnabled}
                  onValueChange={setSoundNotificationEnabled}
                  isDisabled={isSaving || !notificationsEnabled}
                />
              </HStack>
            </FormControl>

            {/* 震动提醒 */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>震动提醒</FormControlLabelText>
              </FormControlLabel>
              <HStack className="items-center justify-between">
                <Text className="text-typography-600">收到通知时震动</Text>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                  isDisabled={isSaving || !notificationsEnabled}
                />
              </HStack>
            </FormControl>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
