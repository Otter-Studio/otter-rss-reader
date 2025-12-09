import React from "react";
import { Box } from "@/components/ui/box";
import { AppNavigation } from "@/components/otter-ui/navigation";
import { Icon } from "@/components/ui/icon";
import { SquareLibrary, Settings, BookOpenText } from "lucide-react-native";
export default function Home() {
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

  const handleItemPress = (key: string) => {
    console.log("Pressed item:", key);
    // 这里可以添加导航逻辑
  };

  return (
    <Box className="flex-1 bg-background-300 h-[100vh]">
      <AppNavigation
        items={navigationItems}
        onItemPress={handleItemPress}
        activeKey="learn"
      />
    </Box>
  );
}
