"use client";
import React, { useMemo, useState, useEffect } from "react";
import {
  Dimensions,
  TouchableOpacity,
  View,
  Text,
  Image,
  LayoutAnimation,
} from "react-native";
import { tva } from "@gluestack-ui/utils/nativewind-utils";

/**
 * AppNavigation 组件 - 应用主页面导航栏
 *
 * 支持多种位置的导航栏，包括顶部、底部、左侧、右侧，以及自动调整位置。
 * 根据屏幕尺寸自动选择适合的导航位置（平板使用左侧，手机使用底部）。
 *
 * @param position - 导航栏位置，可选值：'top' | 'bottom' | 'left' | 'right' | 'auto'，默认值为 'auto'
 * @param spacing - 导航栏距离屏幕边缘的间距（像素），默认值为 0
 * @param items - 导航项目数组，最多支持 5 个项目，每个项目包含 icon、title 和 key
 * @param onItemPress - 项目点击回调函数，参数为项目的 key
 * @param activeKey - 当前活跃项目的 key，用于高亮显示
 * @param rounded - 是否圆角，默认 true
 * @param border - 边框大小，默认 'xl'
 * @param margin - 边距大小，默认 'xl'
 */
type Position = "top" | "bottom" | "left" | "right" | "auto";

interface NavigationItem {
  icon: React.ReactNode | string; // React 组件或图片 URL
  title: string; // 项目标题
  key: string; // 唯一标识符
}

type BorderSize = "xl" | "lg" | "md" | "sm" | "none";
type MarginSize = "xl" | "lg" | "md" | "sm" | "none";

interface AppNavigationProps {
  position?: Position; // 默认为 'auto'
  spacing?: number;
  items: NavigationItem[];
  onItemPress?: (key: string) => void;
  activeKey?: string;
  rounded?: "full" | "lg" | "none"; // 默认为 'full'
  border?: BorderSize; // 默认为 'xl'
  margin?: MarginSize; // 默认为 'xl'
}

const navigationStyle = tva({
  base: "absolute flex justify-center items-center",
  variants: {
    position: {
      top: "top-0 left-0 right-0 h-24",
      bottom: "bottom-0 left-0 right-0 h-24",
      left: "left-0 top-0 bottom-0 w-24",
      right: "right-0 top-0 bottom-0 w-24",
    },
    border: {
      xl: "border-4",
      lg: "border-2",
      md: "border",
      sm: "border-0.5",
      none: "border-0",
    },
    margin: {
      xl: "m-4",
      lg: "m-2",
      md: "m-1",
      sm: "m-0.5",
      none: "m-0",
    },
  },
});

const containerStyle = tva({
  base: "flex justify-around items-center bg-background-100 border-t border-background-200",
  variants: {
    position: {
      top: "flex-row h-16 max-w-96 min-w-48",
      bottom: "flex-row h-16 max-w-96 min-w-48",
      left: "flex-col w-16 max-h-96 min-h-48",
      right: "flex-col w-16 max-h-96 min-h-48",
    },
  },
});

const itemStyle = tva({
  base: "flex items-center justify-center p-2 rounded-lg",
  variants: {
    active: {
      true: "bg-primary-500",
      false: "bg-transparent",
    },
    position: {
      top: "flex-col w-16",
      bottom: "flex-col w-16",
      left: "flex-col h-16",
      right: "flex-col h-16",
    },
    hasIcon: {
      true: "",
      false: "px-3 py-1", // 调整 padding 当没有 icon 时
    },
  },
});

const iconStyle = tva({
  base: "w-8 h-8 flex justify-center items-center",
  variants: {
    active: {
      true: "text-typography-0",
      false: "text-typography-500",
    },
  },
});

const textStyle = tva({
  base: "text-sm font-medium",
  variants: {
    active: {
      true: "text-typography-0 font-bold",
      false: "text-typography-500",
    },
    position: {
      top: "mx-1",
      bottom: "mx-1",
      left: "mx-2",
      right: "mx-2",
    },
    hasIcon: {
      true: "",
      false: "mt-0",
    },
  },
});

const AppNavigation: React.FC<AppNavigationProps> = ({
  position = "auto",
  spacing = 0,
  items,
  onItemPress,
  activeKey,
  rounded = "full",
  border = "lg",
  margin = "xl",
}) => {
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      LayoutAnimation.configureNext({
        duration: 400,
        update: {
          type: LayoutAnimation.Types.spring,
          springDamping: 0.7,
        },
      });
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const actualPosition = useMemo(() => {
    if (position === "auto") {
      return dimensions.width > dimensions.height ? "left" : "bottom";
    }
    return position;
  }, [position, dimensions]);

  const limitedItems = items.slice(0, 5);

  // const containerStyle2 = useMemo(() => {
  //   let style: any = {};
  //   if (actualPosition === "bottom") {
  //     style.bottom = spacing;
  //   } else if (actualPosition === "top") {
  //     style.top = spacing;
  //   } else if (actualPosition === "left") {
  //     style.left = spacing;
  //   } else if (actualPosition === "right") {
  //     style.right = spacing;
  //   }
  //   return style;
  // }, [actualPosition, spacing]);

  const roundedClass = useMemo(() => {
    if (rounded === "none") return "";
    if (rounded === "full") return "rounded-full";
    return "rounded-xl";
  }, [rounded]);

  return (
    <View
      className={`${navigationStyle({
        position: actualPosition,
      })}`}
      // style={containerStyle2}
    >
      <View
        className={`${containerStyle({
          position: actualPosition,
        })} ${navigationStyle({
          border,
          margin,
        })} ${roundedClass}`}
      >
        {limitedItems.map((item) => {
          const isActive = activeKey === item.key;
          const hasIcon = item.icon != null;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onItemPress?.(item.key)}
              className={`${itemStyle({
                active: isActive,
                position: actualPosition,
                hasIcon,
              })}`}
            >
              {typeof item.icon === "string" ? (
                <Image
                  source={{ uri: item.icon }}
                  className={iconStyle({ active: isActive })}
                />
              ) : item.icon ? (
                <View className={iconStyle({ active: isActive })}>
                  {item.icon}
                </View>
              ) : null}
              <Text
                className={textStyle({
                  active: isActive,
                  position: actualPosition,
                  hasIcon,
                })}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export { AppNavigation };
