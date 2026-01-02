import React from "react";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Switch } from "@/components/ui/switch";

export interface SettingsSwitchProps {
  label: string;
  tips: string;
  value: boolean;
  onChange: (value: boolean) => void;
  type?: "base" | "error" | "warning" | "success";
  disabled?: boolean;
}

const settingsSwitchContainer = tva({
  base: "items-center justify-between",
  variants: {
    type: {
      base: "bg-background-50",
      error: "bg-error-50",
      warning: "bg-warning-50",
      success: "bg-success-50",
    },
  },
});

const settingsSwitchLabel = tva({
  base: "text-typography-600",
  variants: {
    type: {
      base: "",
      error: "text-error-600",
      warning: "text-warning-600",
      success: "text-success-600",
    },
  },
});

export const SettingsSwitch: React.FC<SettingsSwitchProps> = ({
  label,
  tips,
  value,
  onChange,
  type = "base",
  disabled = false,
}) => {
  return (
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText>{label}</FormControlLabelText>
      </FormControlLabel>
      <HStack className={settingsSwitchContainer({ type })}>
        <Switch value={value} onValueChange={onChange} isDisabled={disabled} />
      </HStack>
      <FormControlHelper>
        <FormControlHelperText>{tips}</FormControlHelperText>
      </FormControlHelper>
    </FormControl>
  );
};
