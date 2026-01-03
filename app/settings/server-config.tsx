import React from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ScrollView } from "react-native";
import { SettingsOperations } from "@/db/settings";
import { Settings } from "@/components/otter-ui/settings/components/settings";
import { useSettingsConfig } from "@/components/otter-ui/settings/useSettingsConfig";
import type { SettingsGroupConfig } from "@/components/otter-ui/settings/useSettingsConfig";

export default function ServerConfigPage() {
  const settingsConfig: SettingsGroupConfig[] = [
    {
      id: "server-details",
      fields: [
        {
          id: "baseUrl",
          type: "input",
          label: "服务器地址",
          description: "RSS 服务器的完整 URL 地址",
          placeholder: "https://api.example.com/api/greader.php",
          inputType: "url",
          defaultValue: "",
        },
        {
          id: "username",
          type: "input",
          label: "用户名",
          description: "登录服务器的用户名",
          placeholder: "输入用户名",
          inputType: "text",
          defaultValue: "",
        },
        {
          id: "password",
          type: "input",
          label: "密码",
          description: "登录服务器的密码",
          placeholder: "输入密码",
          inputType: "password",
          defaultValue: "",
        },
      ],
    },
  ];

  const { settingsGroups, isLoading } = useSettingsConfig({
    groups: settingsConfig,
    onLoad: async () => {
      try {
        const userInfo = await SettingsOperations.getUserInfo();
        return {
          baseUrl: userInfo?.baseUrl || "",
          username: userInfo?.username || "",
          password: userInfo?.password || "",
        };
      } catch (error) {
        console.error("加载服务器配置失败:", error);
        return {};
      }
    },
    onSave: async (values) => {
      try {
        if (
          values.baseUrl?.trim() &&
          values.username?.trim() &&
          values.password?.trim()
        ) {
          await SettingsOperations.setUserInfo(
            values.baseUrl,
            values.username,
            values.password
          );
        }
      } catch (error) {
        console.error("保存服务器配置失败:", error);
      }
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
        <VStack className="space-y-4">
          <Text className="text-2xl font-bold">服务器配置</Text>
          <Text className="text-sm text-typography-600 mb-2">
            配置您的 RSS 服务器连接信息
          </Text>
          <Settings groups={settingsGroups} />
        </VStack>
      </ScrollView>
    </Box>
  );
}
