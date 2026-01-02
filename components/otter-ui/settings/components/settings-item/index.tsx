import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Switch } from "@/components/ui/switch";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
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
import { ChevronRightIcon, Icon } from "@/components/ui/icon";
import type { SettingItem } from "../../types";
import { InputActionSheet } from "../input";
import { NumberInputActionSheet } from "../number";

interface SettingsItemProps {
  item: SettingItem;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({ item }) => {
  const [showInputSheet, setShowInputSheet] = useState(false);
  const [showNumberSheet, setShowNumberSheet] = useState(false);

  // 分组标题
  if (item.type === "group") {
    return (
      <Box className="py-2">
        <Text className="text-lg font-semibold text-typography-800">
          {item.title}
        </Text>
      </Box>
    );
  }

  // 分隔符
  if (item.type === "divider") {
    return <Divider className="my-4" />;
  }

  // 自定义渲染
  if (item.type === "custom") {
    return <Box>{item.render()}</Box>;
  }

  // 导航项（移动端风格）
  if (item.type === "navigation") {
    return (
      <TouchableOpacity
        onPress={item.onPress}
        disabled={item.disabled}
        activeOpacity={0.7}
      >
        <HStack className="items-center justify-between py-4 px-4 bg-background-0 rounded-lg">
          <VStack className="flex-1">
            <Text className="text-base font-medium text-typography-900">
              {item.label}
            </Text>
            {item.description && item.description.trim() !== "" && (
              <Text className="text-sm text-typography-500 mt-1">
                {item.description}
              </Text>
            )}
          </VStack>
          <HStack className="items-center space-x-2">
            {item.value && (
              <Text className="text-sm text-typography-400">{item.value}</Text>
            )}
            <Icon
              as={ChevronRightIcon}
              className="text-typography-400"
              size="sm"
            />
          </HStack>
        </HStack>
      </TouchableOpacity>
    );
  }

  // 输入框（移动端风格：点击弹出 ActionSheet）
  if (item.type === "input") {
    const displayValue = item.value || item.placeholder || "未设置";
    const isPlaceholder = !item.value;

    return (
      <>
        <TouchableOpacity
          onPress={() => setShowInputSheet(true)}
          disabled={item.disabled}
          activeOpacity={0.7}
        >
          <HStack className="items-center justify-between py-4 px-4 bg-background-0 rounded-lg">
            <VStack className="flex-1 mr-4">
              <Text className="text-base font-medium text-typography-900">
                {item.label}
              </Text>
              {item.description && item.description.trim() !== "" && (
                <Text className="text-sm text-typography-500 mt-1">
                  {item.description}
                </Text>
              )}
            </VStack>
            <HStack className="items-center space-x-2">
              <Text
                className={`text-sm ${
                  isPlaceholder ? "text-typography-400" : "text-typography-700"
                }`}
              >
                {item.inputType === "password" && item.value
                  ? "••••••"
                  : displayValue}
              </Text>
              <Icon
                as={ChevronRightIcon}
                className="text-typography-400"
                size="sm"
              />
            </HStack>
          </HStack>
        </TouchableOpacity>

        <InputActionSheet
          isOpen={showInputSheet}
          onClose={() => setShowInputSheet(false)}
          title={item.label}
          description={item.description}
          value={item.value}
          placeholder={item.placeholder}
          inputType={item.inputType === "password" ? "password" : "text"}
          onChange={item.onChange}
        />
      </>
    );
  }

  // 数字输入框（移动端风格：点击弹出 ActionSheet）
  if (item.type === "number") {
    const displayValue = item.value
      ? String(item.value)
      : item.placeholder || "未设置";
    const isPlaceholder = !item.value && item.value !== 0;

    return (
      <>
        <TouchableOpacity
          onPress={() => setShowNumberSheet(true)}
          disabled={item.disabled}
          activeOpacity={0.7}
        >
          <HStack className="items-center justify-between py-4 px-4 bg-background-0 rounded-lg">
            <VStack className="flex-1 mr-4">
              <Text className="text-base font-medium text-typography-900">
                {item.label}
              </Text>
              {item.description && item.description.trim() !== "" && (
                <Text className="text-sm text-typography-500 mt-1">
                  {item.description}
                </Text>
              )}
            </VStack>
            <HStack className="items-center space-x-2">
              <Text
                className={`text-sm ${
                  isPlaceholder ? "text-typography-400" : "text-typography-700"
                }`}
              >
                {displayValue}
              </Text>
              <Icon
                as={ChevronRightIcon}
                className="text-typography-400"
                size="sm"
              />
            </HStack>
          </HStack>
        </TouchableOpacity>

        <NumberInputActionSheet
          isOpen={showNumberSheet}
          onClose={() => setShowNumberSheet(false)}
          title={item.label}
          description={item.description}
          value={item.value}
          placeholder={item.placeholder}
          min={item.min}
          max={item.max}
          onChange={item.onChange}
        />
      </>
    );
  }

  // 开关（移动端风格：左右布局）
  if (item.type === "switch") {
    return (
      <HStack className="items-center justify-between py-4 px-4 bg-background-0 rounded-lg">
        <VStack className="flex-1 mr-4">
          <Text className="text-base font-medium text-typography-900">
            {item.label}
          </Text>
          {item.description && item.description.trim() !== "" && (
            <Text className="text-sm text-typography-500 mt-1">
              {item.description}
            </Text>
          )}
        </VStack>
        <Switch
          value={item.value}
          onValueChange={item.onChange}
          isDisabled={item.disabled}
        />
      </HStack>
    );
  }

  // 选择器（移动端风格：左右布局）
  if (item.type === "select") {
    const selectedOption = item.options.find((opt) => opt.value === item.value);
    const displayValue = selectedOption?.label || item.placeholder || "请选择";

    return (
      <HStack className="items-center justify-between py-4 px-4 bg-background-0 rounded-lg">
        <VStack className="flex-1 mr-4">
          <Text className="text-base font-medium text-typography-900">
            {item.label}
          </Text>
          {item.description && item.description.trim() !== "" && (
            <Text className="text-sm text-typography-500 mt-1">
              {item.description}
            </Text>
          )}
        </VStack>
        <Box className="min-w-[100px]">
          <Select
            selectedValue={item.value}
            onValueChange={item.onChange}
            isDisabled={item.disabled}
          >
            <SelectTrigger variant="outline" size="sm">
              <SelectInput placeholder={item.placeholder || "请选择"} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {item.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </Box>
      </HStack>
    );
  }

  // 按钮
  if (item.type === "button") {
    return (
      <Box className="px-4 py-2">
        {item.label && item.label.trim() !== "" && (
          <VStack className="mb-2">
            <Text className="text-base font-medium text-typography-900">
              {item.label}
            </Text>
            {item.description && item.description.trim() !== "" && (
              <Text className="text-sm text-typography-500 mt-0.5">
                {item.description}
              </Text>
            )}
          </VStack>
        )}
        <Button
          onPress={item.onPress}
          isDisabled={item.disabled}
          className={
            item.variant === "primary"
              ? "bg-primary-600 active:bg-primary-700"
              : item.variant === "secondary"
              ? "bg-secondary-600 active:bg-secondary-700"
              : item.variant === "outline"
              ? "border-primary-600 border"
              : ""
          }
        >
          <ButtonText>{item.buttonText}</ButtonText>
        </Button>
      </Box>
    );
  }

  return null;
};
