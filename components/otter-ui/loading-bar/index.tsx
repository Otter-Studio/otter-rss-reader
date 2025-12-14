import React, { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { tva } from "@gluestack-ui/utils/nativewind-utils";

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
  if (!isLoading) return null;

  return (
    <Box className={loadingContainer({ isLoading })}>
      <Box className={loadingLine({ isLoading })}></Box>
    </Box>
  );
};
