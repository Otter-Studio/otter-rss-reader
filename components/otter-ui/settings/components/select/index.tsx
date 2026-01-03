import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { ChevronRightIcon, Icon } from "@/components/ui/icon";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  ActionsheetItem,
  ActionsheetItemText,
} from "@/components/ui/actionsheet";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui/form-control";

// 样式定义
const selectActionSheetContent = tva({
  base: "pb-6",
});

const selectActionSheetVStack = tva({
  base: "w-full px-4 py-4 space-y-4",
});

const selectActionSheetTitle = tva({
  base: "text-lg font-semibold",
});

const selectActionSheetOptionsContainer = tva({
  base: "mt-3 space-y-2",
});

const selectActionSheetOptionRow = tva({
  base: "items-center justify-between w-full",
});

const selectActionSheetCheckmark = tva({
  base: "text-primary-600",
});

const selectActionSheetButtonRow = tva({
  base: "space-x-3 mt-4",
});

const selectActionSheetCancelButton = tva({
  base: "flex-1",
});

const selectActionSheetConfirmButton = tva({
  base: "flex-1 bg-primary-600",
});

const selectItemContainer = tva({
  base: "items-center justify-between py-3 px-4 bg-background-0 rounded-lg",
});

const selectItemContent = tva({
  base: "flex-1 mr-4",
});

const selectItemLabel = tva({
  base: "text-base font-medium text-typography-900",
});

const selectItemDescription = tva({
  base: "text-sm text-typography-500 mt-0.5",
});

const selectItemValueRow = tva({
  base: "items-center space-x-2",
});

const selectItemValue = tva({
  base: "text-sm",
  variants: {
    placeholder: {
      true: "text-typography-400",
      false: "text-typography-700",
    },
  },
});

const selectItemIcon = tva({
  base: "text-typography-400",
});

// ActionSheet 选择组件
interface SelectActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}

export const SelectActionSheet: React.FC<SelectActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  value,
  options,
  onChange,
}) => {
  const [tempValue, setTempValue] = useState(value);

  React.useEffect(() => {
    if (isOpen) {
      setTempValue(value);
    }
  }, [isOpen, value]);

  const handleConfirm = () => {
    onChange(tempValue);
    onClose();
  };

  const handleCancel = () => {
    setTempValue(value);
    onClose();
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={handleCancel}>
      <ActionsheetBackdrop />
      <ActionsheetContent className={selectActionSheetContent()}>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <VStack className={selectActionSheetVStack()}>
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText className={selectActionSheetTitle()}>
                {title}
              </FormControlLabelText>
            </FormControlLabel>
            {description && description.trim() !== "" && (
              <FormControlHelper>
                <FormControlHelperText>{description}</FormControlHelperText>
              </FormControlHelper>
            )}
            <VStack className={selectActionSheetOptionsContainer()}>
              {options.map((option) => (
                <ActionsheetItem
                  key={option.value}
                  onPress={() => setTempValue(option.value)}
                >
                  <HStack className={selectActionSheetOptionRow()}>
                    <ActionsheetItemText>{option.label}</ActionsheetItemText>
                    {tempValue === option.value && (
                      <Text className={selectActionSheetCheckmark()}>✓</Text>
                    )}
                  </HStack>
                </ActionsheetItem>
              ))}
            </VStack>
          </FormControl>

          <HStack className={selectActionSheetButtonRow()}>
            <Button onPress={handleCancel} variant="outline" className={selectActionSheetCancelButton()}>
              <ButtonText>取消</ButtonText>
            </Button>
            <Button onPress={handleConfirm} className={selectActionSheetConfirmButton()}>
              <ButtonText>确定</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
};

// 移动端选择项组件
interface SettingsSelectItemProps {
  label: string;
  description?: string;
  value: string;
  placeholder?: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const SettingsSelectItem: React.FC<SettingsSelectItemProps> = ({
  label,
  description,
  value,
  placeholder,
  options,
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
        <HStack className={selectItemContainer()}>
          <VStack className={selectItemContent()}>
            <Text className={selectItemLabel()}>
              {label}
            </Text>
            {description && description.trim() !== "" && (
              <Text className={selectItemDescription()}>
                {description}
              </Text>
            )}
          </VStack>
          <HStack className={selectItemValueRow()}>
            <Text
              className={selectItemValue({
                placeholder: isPlaceholder,
              })}
            >
              {displayValue}
            </Text>
            <Icon
              as={ChevronRightIcon}
              className={selectItemIcon()}
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
        value={value}
        options={options}
        onChange={onChange}
      />
    </>
  );
};
