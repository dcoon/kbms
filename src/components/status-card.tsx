import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Card, Text, useTheme } from 'react-native-paper';

interface StatusCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
}

export function StatusCard({ label, value, unit, icon, color }: StatusCardProps) {
  const theme = useTheme();
  
  return (
    <Card style={{ margin: 4, flex: 1, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
        <View style={{ 
          width: 44, 
          height: 44, 
          borderRadius: 22, 
          backgroundColor: color + '15', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginRight: 12
        }}>
          <Image 
            source={icon} 
            contentFit="contain" 
            style={{ width: 22, height: 22, tintColor: color }} 
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{label}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{value}</Text>
            {unit && <Text variant="bodySmall" style={{ marginLeft: 2, color: theme.colors.onSurfaceVariant }}>{unit}</Text>}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}
