"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui/form-control";
import { SettingsOperations } from "@/db/settings";
import { Toast, useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const [baseUrl, setBaseUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

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
            render: ({ id }) => (
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
          render: ({ id }) => (
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
          render: ({ id }) => (
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
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="warning" variant="solid">
              <Text>请输入密码</Text>
            </Toast>
          ),
        });
        return;
      }

      setIsSaving(true);
      await SettingsOperations.setUserInfo(baseUrl, username, password);

      toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }) => (
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
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <Text>保存设置失败</Text>
          </Toast>
        ),
      });
    } finally {
      setIsSaving(false);
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
      <VStack className="p-4 space-y-6">
        <Text className="text-2xl font-bold">设置</Text>

        {/* 服务器设置区域 */}
        <VStack className="space-y-4 bg-background-0 rounded-lg p-4">
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
      </VStack>
    </Box>
  );
}
