import React from "react";
import { Box } from "@/components/ui/box";
import { Platform } from "react-native";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";

interface LoadingBarProps {
  isLoading?: boolean;
}

const loadingContainer = tva({
  base: "w-full h-1",
  variants: {
    isLoading: {
      true: "bg-background-50",
      false: "bg-transparent",
    },
  },
});

const loadingLine = tva({
  base: "w-20 h-1",
  variants: {
    isLoading: {
      true: "bg-primary-500 animate-slideLeftRight",
      false: "bg-transparent",
    },
  },
});
export const LoadingBar: React.FC<LoadingBarProps> = ({
  isLoading = false,
}) => {
  const isWeb = Platform.OS === "web";
  if (!isLoading) return null;

  return isWeb ? (
    <Box className={loadingContainer({ isLoading })}>
      <Box className={loadingLine({ isLoading })}></Box>
    </Box>
  ) : (
    <Center className="bg-background-50 h-8 w-full">
      <Text className="primary-500 font-bold">Loading</Text>
    </Center>
  );
};
