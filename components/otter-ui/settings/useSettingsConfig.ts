import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { SettingsGroup } from "./types";

export interface SettingsFieldConfig {
  id: string;
  type: "input" | "number" | "switch" | "select" | "navigation" | "button";
  label: string;
  description?: string;
  placeholder?: string;
  inputType?: "text" | "password" | "email" | "url";
  min?: number;
  max?: number;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: any;
  disabled?: boolean | ((values: Record<string, any>) => boolean);
  // Navigation specific
  route?: string;
  valueFormatter?: (values: Record<string, any>) => string;
}

export interface SettingsGroupConfig {
  id: string;
  title?: string;
  description?: string;
  fields: SettingsFieldConfig[];
}

export interface SettingsConfigOptions {
  groups: SettingsGroupConfig[];
  onLoad?: () => Promise<Record<string, any>>;
  onSave?: (values: Record<string, any>) => Promise<void>;
  customHandlers?: Record<string, (value: any) => void | Promise<void>>;
  onPress?: Record<string, () => void | Promise<void>>;
}

export function useSettingsConfig(options: SettingsConfigOptions) {
  const { groups, onLoad, onSave, customHandlers = {}, onPress = {} } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [values, setValues] = useState<Record<string, any>>({});
  const isFirstRender = useRef(true);

  // 使用 ref 保存回调函数避免依赖变化
  const customHandlersRef = useRef(customHandlers);
  const onPressRef = useRef(onPress);
  const onSaveRef = useRef(onSave);
  const handlersCache = useRef<Record<string, (value: any) => Promise<void>>>({});

  useEffect(() => {
    customHandlersRef.current = customHandlers;
    onPressRef.current = onPress;
    onSaveRef.current = onSave;
  });

  // 初始化默认值 - 只在第一次渲染时执行
  useEffect(() => {
    if (isFirstRender.current) {
      const defaultValues: Record<string, any> = {};
      groups.forEach((group) => {
        group.fields.forEach((field) => {
          if (field.defaultValue !== undefined) {
            defaultValues[field.id] = field.defaultValue;
          }
        });
      });
      setValues(defaultValues);
      isFirstRender.current = false;
    }
  }, []);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      if (onLoad) {
        try {
          const loadedValues = await onLoad();
          setValues((prev) => ({ ...prev, ...loadedValues }));
        } catch (error) {
          console.error("加载设置失败:", error);
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  // 自动保存
  useEffect(() => {
    if (isLoading || isFirstRender.current) return;

    const saveData = async () => {
      if (onSaveRef.current) {
        try {
          await onSaveRef.current(values);
        } catch (error) {
          console.error("保存设置失败:", error);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      saveData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [values, isLoading]);

  // 创建稳定的 onChange 处理器
  const getChangeHandler = useCallback((fieldId: string) => {
    if (!handlersCache.current[fieldId]) {
      handlersCache.current[fieldId] = async (value: any) => {
        // 如果有自定义处理器，先执行
        if (customHandlersRef.current[fieldId]) {
          await customHandlersRef.current[fieldId](value);
        }
        // 更新状态
        setValues((prev) => ({ ...prev, [fieldId]: value }));
      };
    }
    return handlersCache.current[fieldId];
  }, []);

  // 将配置转换为 SettingsGroup
  const settingsGroups: SettingsGroup[] = useMemo(() => {
    return groups.map((group) => ({
      id: group.id,
      title: group.title,
      description: group.description,
      items: group.fields.map((field) => {
        const baseItem = {
          id: field.id,
          label: field.label,
          description: field.description,
          disabled:
            typeof field.disabled === "function"
              ? field.disabled(values)
              : field.disabled,
        };

        switch (field.type) {
          case "input":
            return {
              ...baseItem,
              type: "input" as const,
              value: values[field.id] || "",
              placeholder: field.placeholder,
              inputType: field.inputType || "text",
              onChange: getChangeHandler(field.id),
            };

          case "number":
            return {
              ...baseItem,
              type: "number" as const,
              value: values[field.id] || 0,
              placeholder: field.placeholder,
              min: field.min,
              max: field.max,
              onChange: getChangeHandler(field.id),
            };

          case "switch":
            return {
              ...baseItem,
              type: "switch" as const,
              value: values[field.id] || false,
              onChange: getChangeHandler(field.id),
            };

          case "select":
            return {
              ...baseItem,
              type: "select" as const,
              value: values[field.id] || "",
              options: field.options || [],
              placeholder: field.placeholder,
              onChange: getChangeHandler(field.id),
            };

          case "navigation":
            return {
              ...baseItem,
              type: "navigation" as const,
              value: field.valueFormatter
                ? field.valueFormatter(values)
                : values[field.id] || "未配置",
              onPress: () => {
                if (field.route && customHandlersRef.current[field.id]) {
                  customHandlersRef.current[field.id](field.route);
                }
              },
            };

          case "button":
            return {
              ...baseItem,
              type: "button" as const,
              buttonText: field.label,
              onPress: () => {
                if (onPressRef.current[field.id]) {
                  onPressRef.current[field.id]();
                }
              },
            };

          default:
            return baseItem as any;
        }
      }),
    }));
  }, [groups, values, getChangeHandler]);

  return {
    settingsGroups,
    values,
    isLoading,
    setValues,
  };
}
