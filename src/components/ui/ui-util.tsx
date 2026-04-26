import { PaperTheme } from "@/util/paper-theme";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export const DEFAULT_ICON_SIZE = 24;

export function ValueChip({ value, valueSuffix, title }: { value?: number, valueSuffix?: string, title: string }) {
  const theme = useTheme() as typeof PaperTheme;
  return (
    <View style={{ alignItems: 'center', flexDirection: 'column', rowGap: 6 }}>
      <Text variant="labelLarge" style={{ color: theme.fonts.labelLarge.fontColor }}>{value !== undefined ? value : '?'}{valueSuffix}</Text>
      <Text variant="labelMedium" style={{ color: theme.fonts.labelMedium.fontColor }}>{title}</Text>
    </View>
  );
}

