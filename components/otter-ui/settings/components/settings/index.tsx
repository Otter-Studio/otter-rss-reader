import React from "react";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { SettingsItem } from "../settings-item";
import type { SettingsGroup } from "../../types";

interface SettingsProps {
  groups: SettingsGroup[];
}

export const Settings: React.FC<SettingsProps> = ({ groups }) => {
  return (
    <VStack>
      {groups.map((group) => (
        <VStack
          key={group.id}
          className="mb-4 space-y-4 bg-background-0 rounded-lg p-4 shadow-sm"
        >
          {group.title && group.title.trim() !== "" && (
            <Text className="text-lg font-semibold text-typography-800">
              {group.title}
            </Text>
          )}
          {group.description && group.description.trim() !== "" && (
            <Text className="text-sm text-typography-600 mb-2">
              {group.description}
            </Text>
          )}
          <VStack>
            {group.items.map((item) => (
              <Box key={item.id} className="mb-2">
                <SettingsItem item={item} />
              </Box>
            ))}
          </VStack>
        </VStack>
      ))}
    </VStack>
  );
};
