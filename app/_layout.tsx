import "reflect-metadata";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";
import { AppNavigation } from "@/components/otter-ui/navigation";
import type { NavigationItem } from "@/components/otter-ui/navigation";
import { SquareLibrary, Settings, BookOpenText } from "lucide-react-native";
import { dbManager } from "@/db/database";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, useThemeContext } from "@/components/ThemeContext";
import { CacheContextProvider } from "@/hooks/useCache/context";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [dbLoaded, setDbLoaded] = useState(false);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // 初始化数据库
  useEffect(() => {
    const initializeDb = async () => {
      try {
        await dbManager.initialize();
      } catch (error) {
        console.error("Database initialization failed:", error);
      } finally {
        setDbLoaded(true);
      }
    };

    initializeDb();
  }, []);

  // 隐藏启动屏幕
  useEffect(() => {
    if (loaded && dbLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbLoaded]);

  // 等待字体和数据库都加载完成
  if (!loaded || !dbLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const pathname = usePathname();
  const { colorMode } = useThemeContext();
  const router = useRouter();

  const navigationItems: NavigationItem[] = [
    {
      icon: (props: { className?: string }) => (
        <Icon as={BookOpenText} size="lg" className={props.className} />
      ),
      title: "文章",
      key: "items",
    },
    {
      icon: (props: { className?: string }) => (
        <Icon as={SquareLibrary} size="lg" className={props.className} />
      ),
      title: "订阅",
      key: "feeds",
    },
    {
      icon: (props: { className?: string }) => (
        <Icon as={Settings} size="lg" className={props.className} />
      ),
      title: "设置",
      key: "settings",
    },
  ];

  // 根据当前路径获取 activeKey
  const activeKey = pathname.includes("items")
    ? "items"
    : pathname.includes("feeds")
    ? "feeds"
    : pathname.includes("settings")
    ? "settings"
    : "items";

  return (
    <SafeAreaProvider>
      <CacheContextProvider>
        <GluestackUIProvider mode={colorMode}>
          <NavigationThemeProvider
            value={colorMode === "dark" ? DarkTheme : DefaultTheme}
          >
            <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
              <Box
                className={`flex-1 bg-background-0 dark:bg-background-800 flex flex-col`}
              >
                <Box className="flex-1 pb-24">
                  <Slot />
                </Box>
                <AppNavigation
                  items={navigationItems}
                  onItemPress={(key) => router.navigate(`/${key}` as any)}
                  activeKey={activeKey}
                />
              </Box>
            </SafeAreaView>
          </NavigationThemeProvider>
        </GluestackUIProvider>
      </CacheContextProvider>
    </SafeAreaProvider>
  );
}
