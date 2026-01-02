/**
 * Settings 配置项的基础类型
 */

// 基础设置项接口
export interface BaseSettingItem {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

// 输入框设置项
export interface InputSettingItem extends BaseSettingItem {
  type: "input";
  value: string;
  placeholder?: string;
  inputType?: "text" | "password" | "email" | "url";
  onChange: (value: string) => void;
}

// 数字输入框设置项
export interface NumberSettingItem extends BaseSettingItem {
  type: "number";
  value: number;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

// 开关设置项
export interface SwitchSettingItem extends BaseSettingItem {
  type: "switch";
  value: boolean;
  onChange: (value: boolean) => void;
}

// 选择器设置项
export interface SelectSettingItem extends BaseSettingItem {
  type: "select";
  value: string;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  onChange: (value: string) => void;
}

// 按钮设置项
export interface ButtonSettingItem {
  type: "button";
  id: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  buttonText: string;
  variant?: "primary" | "secondary" | "outline" | "link";
  onPress: () => void | Promise<void>;
}

// 分组标题
export interface GroupHeaderItem {
  type: "group";
  id: string;
  title: string;
}

// 分隔符
export interface DividerItem {
  type: "divider";
  id: string;
}

// 自定义渲染项
export interface CustomSettingItem {
  type: "custom";
  id: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  render: () => React.ReactNode;
}

// 联合类型
export type SettingItem =
  | InputSettingItem
  | NumberSettingItem
  | SwitchSettingItem
  | SelectSettingItem
  | ButtonSettingItem
  | GroupHeaderItem
  | DividerItem
  | CustomSettingItem;

// 设置组
export interface SettingsGroup {
  id: string;
  title?: string;
  description?: string;
  items: SettingItem[];
}

// 完整的设置配置
export interface SettingsConfig {
  groups: SettingsGroup[];
}
