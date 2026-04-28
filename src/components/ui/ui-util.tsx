import { DefaultTheme } from "@/theme/theme";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export const DEFAULT_ICON_SIZE = 24;

export function ValueChip({ value, valueSuffix, title }: { value?: number, valueSuffix?: string, title: string }) {
  const theme = useTheme() as typeof DefaultTheme;
  return (
    <View style={theme.components.valueChip.style as any}>
      <Text variant="labelLarge">{value !== undefined ? value : '?'}{valueSuffix}</Text>
      <Text variant="labelSmall">{title}</Text>
    </View>
  );
}

