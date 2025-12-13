import React, { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";

interface LoadingBarProps {
  isLoading?: boolean;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({
  isLoading = false,
}) => {
  const [progress, setProgress] = useState(10);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(10);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 20;
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      // 当停止加载时，快速完成进度条
      setProgress(100);

      // 延迟隐藏，让用户看到完成动画
      const hideTimeout = setTimeout(() => {
        setVisible(false);
      }, 300);

      return () => clearTimeout(hideTimeout);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <Box className="w-full h-1 bg-transparent">
      <Progress value={progress} className="w-full h-1" size="xs">
        <ProgressFilledTrack />
      </Progress>
    </Box>
  );
};
