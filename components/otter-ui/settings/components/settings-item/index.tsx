import React from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
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
import type { SettingItem } from "../../types";

interface SettingsItemProps {
  item: SettingItem;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({ item }) => {
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

  // 输入框
  if (item.type === "input") {
    const inputType =
      item.inputType === "email" || item.inputType === "url"
        ? "text"
        : item.inputType || "text";

    return (
      <FormControl isDisabled={item.disabled}>
        <FormControlLabel>
          <FormControlLabelText>{item.label}</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            placeholder={item.placeholder}
            value={item.value}
            onChangeText={item.onChange}
            type={inputType}
          />
        </Input>
        {item.description && item.description.trim() !== "" && (
          <FormControlHelper>
            <FormControlHelperText>{item.description}</FormControlHelperText>
          </FormControlHelper>
        )}
      </FormControl>
    );
  }

  // 数字输入框
  if (item.type === "number") {
    return (
      <FormControl isDisabled={item.disabled}>
        <FormControlLabel>
          <FormControlLabelText>{item.label}</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            placeholder={item.placeholder}
            value={String(item.value)}
            onChangeText={(text) => {
              const num = parseInt(text, 10);
              if (!isNaN(num)) {
                item.onChange(num);
              }
            }}
            keyboardType="numeric"
          />
        </Input>
        {item.description && item.description.trim() !== "" && (
          <FormControlHelper>
            <FormControlHelperText>{item.description}</FormControlHelperText>
          </FormControlHelper>
        )}
      </FormControl>
    );
  }

  // 开关
  if (item.type === "switch") {
    return (
      <FormControl isDisabled={item.disabled}>
        <FormControlLabel>
          <FormControlLabelText>{item.label}</FormControlLabelText>
        </FormControlLabel>
        <HStack className="items-center justify-between">
          <Switch
            value={item.value}
            onValueChange={item.onChange}
            isDisabled={item.disabled}
          />
        </HStack>
        {item.description && item.description.trim() !== "" && (
          <FormControlHelper>
            <FormControlHelperText>{item.description}</FormControlHelperText>
          </FormControlHelper>
        )}
      </FormControl>
    );
  }

  // 选择器
  if (item.type === "select") {
    return (
      <FormControl isDisabled={item.disabled}>
        <FormControlLabel>
          <FormControlLabelText>{item.label}</FormControlLabelText>
        </FormControlLabel>
        <Select
          selectedValue={item.value}
          onValueChange={item.onChange}
          isDisabled={item.disabled}
        >
          <SelectTrigger>
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
        {item.description && item.description.trim() !== "" && (
          <FormControlHelper>
            <FormControlHelperText>{item.description}</FormControlHelperText>
          </FormControlHelper>
        )}
      </FormControl>
    );
  }

  // 按钮
  if (item.type === "button") {
    return (
      <FormControl isDisabled={item.disabled}>
        {item.label && item.label.trim() !== "" && (
          <FormControlLabel>
            <FormControlLabelText>{item.label}</FormControlLabelText>
          </FormControlLabel>
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
        {item.description && item.description.trim() !== "" && (
          <FormControlHelper>
            <FormControlHelperText>{item.description}</FormControlHelperText>
          </FormControlHelper>
        )}
      </FormControl>
    );
  }

  return null;
};
