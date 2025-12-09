import React from "react";
import { Box } from "@/components/ui/box";
import { AppNavigation } from "@/components/otter-ui/navigation";

export default function Home() {
  const navigationItems = [
    {
      title: "学习",
      key: "learn",
    },
    {
      title: "数据",
      key: "data",
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
