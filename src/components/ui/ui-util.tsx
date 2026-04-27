import { LightTheme } from "@/theme/theme";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export const DEFAULT_ICON_SIZE = 24;

export function ValueChip({ value, valueSuffix, title }: { value?: number, valueSuffix?: string, title: string }) {
  const theme = useTheme() as typeof LightTheme;
  return (
    <View style={{ alignItems: 'center', flexDirection: 'column' }}>
      <Text variant="titleLarge" >{value !== undefined ? value : '?'}{valueSuffix}</Text>
      <Text variant="titleMedium">{title}</Text>
    </View>
  );
}

