import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { ChevronRightIcon, Icon } from "@/components/ui/icon";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui/form-control";
import { CheckIcon } from "@/components/ui/icon";

export interface SelectOption {
  label: string;
  value: string;
}

// ActionSheet 选择组件
interface SelectActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  options: SelectOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export const SelectActionSheet: React.FC<SelectActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  options,
  selectedValue,
  onChange,
}) => {
  const handleSelect = (value: string) => {
    onChange(value);
    onClose();
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="pb-6">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <VStack className="w-full px-4 py-4 space-y-4">
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText className="text-lg font-semibold">
                {title}
              </FormControlLabelText>
            </FormControlLabel>
            {description && description.trim() !== "" && (
              <FormControlHelper>
                <FormControlHelperText>{description}</FormControlHelperText>
              </FormControlHelper>
            )}
          </FormControl>

          <ActionsheetScrollView className="max-h-96">
            <VStack className="w-full">
              {options.map((option) => (
                <ActionsheetItem
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                >
                  <HStack className="items-center justify-between w-full">
                    <ActionsheetItemText>{option.label}</ActionsheetItemText>
                    {selectedValue === option.value && (
                      <Icon
                        as={CheckIcon}
                        className="text-primary-600"
                        size="sm"
                      />
                    )}
                  </HStack>
                </ActionsheetItem>
              ))}
            </VStack>
          </ActionsheetScrollView>
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
};

// 移动端选择项组件
interface SettingsSelectItemProps {
  label: string;
  description?: string;
  options: SelectOption[];
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const SettingsSelectItem: React.FC<SettingsSelectItemProps> = ({
  label,
  description,
  options,
  value,
  placeholder,
  onChange,
  disabled = false,
}) => {
  const [showSheet, setShowSheet] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder || "未设置";
  const isPlaceholder = !selectedOption;

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowSheet(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <HStack className="items-center justify-between py-3 px-4 bg-background-0 rounded-lg">
          <VStack className="flex-1 mr-4">
            <Text className="text-base font-medium text-typography-900">
              {label}
            </Text>
            {description && description.trim() !== "" && (
              <Text className="text-sm text-typography-500 mt-0.5">
                {description}
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

      <SelectActionSheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        title={label}
        description={description}
        options={options}
        selectedValue={value}
        onChange={onChange}
      />
    </>
  );
};
