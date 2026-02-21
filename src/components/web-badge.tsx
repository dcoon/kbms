import { version } from 'expo/package.json';
import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export function WebBadge() {
  const theme = useTheme();

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        v{version}
      </Text>
      <Image
        source={require('@/assets/images/expo-badge.png')}
        style={{ width: 123, aspectRatio: 123 / 24, opacity: 0.6 }}
      />
    </View>
  );
}
