import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useColorScheme } from "@/components/useColorScheme";
import { Slot, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Fab, FabIcon } from "@/components/ui/fab";
import { MoonIcon, SunIcon, Icon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { AppNavigation } from "@/components/otter-ui/navigation";
import { SquareLibrary, Settings, BookOpenText } from "lucide-react-native";
import { dbManager } from "@/db/database";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
  const [styleLoaded, setStyleLoaded] = useState(false);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // 初始化数据库
  useEffect(() => {
    const initializeDb = async () => {
      try {
        await dbManager.initialize();
        setDbLoaded(true);
      } catch (error) {
        console.error("Database initialization failed:", error);
        // 继续加载 UI，即使数据库初始化失败
        setDbLoaded(true);
      }
    };

    initializeDb();
  }, []);

  useEffect(() => {
    if (loaded && dbLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbLoaded]);

  // 等待字体和数据库都加载完成
  if (!loaded || !dbLoaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const pathname = usePathname();
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  const router = useRouter();

  const navigationItems = [
    {
      icon: <Icon as={BookOpenText} size="lg" />,
      title: "阅读",
      key: "learn",
    },
    {
      icon: <Icon as={SquareLibrary} size="lg" />,
      title: "列表",
      key: "list",
    },
    {
      icon: <Icon as={Settings} size="lg" />,
      title: "设置",
      key: "settings",
    },
  ];

  // 根据当前路径获取 activeKey
  const getActiveKey = () => {
    if (pathname.includes("learn")) return "learn";
    if (pathname.includes("list")) return "list";
    if (pathname.includes("settings")) return "settings";
    return "learn";
  };

  const handleItemPress = (key: string) => {
    router.navigate(`/${key}` as any);
  };

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode={colorMode}>
        <ThemeProvider value={colorMode === "dark" ? DarkTheme : DefaultTheme}>
          <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
            <Box className="flex-1 bg-background-300 flex flex-col">
              <Box className="flex-1">
                <Slot />
              </Box>
              <AppNavigation
                items={navigationItems}
                onItemPress={handleItemPress}
                activeKey={getActiveKey()}
              />
            </Box>
            <Fab
              onPress={() =>
                setColorMode(colorMode === "dark" ? "light" : "dark")
              }
              className="absolute bottom-24 right-4"
              size="lg"
            >
              <FabIcon as={colorMode === "dark" ? MoonIcon : SunIcon} />
            </Fab>
          </SafeAreaView>
        </ThemeProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
