import React, { createContext, useContext, useEffect, useState } from "react";
import { SettingsOperations } from "@/db/settings";
import { useColorScheme } from "./useColorScheme";

type ColorMode = "light" | "dark" | "system";

interface ThemeContextType {
  colorMode: "light" | "dark";
  themeSetting: ColorMode;
  setThemeSetting: (theme: ColorMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeSetting, setThemeSettingState] = useState<ColorMode>("light");
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  const systemColorScheme = useColorScheme();

  // 初始化主题设置
  useEffect(() => {
    const initTheme = async () => {
      try {
        const settings = await SettingsOperations.getSettings();
        if (settings) {
          setThemeSettingState(settings.theme);
          // 应用主题
          applyTheme(settings.theme);
        }
      } catch (error) {
        console.error("加载主题设置失败:", error);
      }
    };

    initTheme();
  }, []);

  // 当系统颜色方案改变时更新
  useEffect(() => {
    if (themeSetting === "system" && systemColorScheme) {
      setColorMode(systemColorScheme);
      updateDOMTheme(systemColorScheme);
    }
  }, [systemColorScheme, themeSetting]);

  const applyTheme = (theme: ColorMode) => {
    if (theme === "system") {
      const systemTheme = systemColorScheme || "light";
      setColorMode(systemTheme);
      updateDOMTheme(systemTheme);
    } else {
      setColorMode(theme as "light" | "dark");
      updateDOMTheme(theme as "light" | "dark");
    }
  };

  const updateDOMTheme = (mode: "light" | "dark") => {
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      if (mode === "dark") {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    }
  };

  const setThemeSetting = async (theme: ColorMode) => {
    try {
      // 先更新本地状态
      setThemeSettingState(theme);

      // 应用主题
      applyTheme(theme);

      // 然后保存到数据库
      await SettingsOperations.updateSettings({ theme });
    } catch (error) {
      console.error("保存主题设置失败:", error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ colorMode, themeSetting, setThemeSetting }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return context;
}
