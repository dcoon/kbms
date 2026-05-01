import { DefaultTheme } from "@/theme/theme";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";


export function ValueChip({ value, valueSuffix, title }: { value?: number | string, valueSuffix?: string, title: string }) {
  const theme = useTheme() as typeof DefaultTheme;
  return (
    <View style={theme.components.valueChip.style as any}>
      <Text
        style={theme.components.valueChip.valueStyle as any}
        >{value !== undefined ? value : '--'}{valueSuffix}</Text>
      <Text
        style={theme.components.valueChip.titleStyle as any}
      >{title}</Text>
    </View>
  );
}

