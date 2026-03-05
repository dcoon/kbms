import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Text, useTheme, TouchableRipple } from 'react-native-paper';

export interface DeviceCardProps {
  name: string;
  id: string;
  rssi?: number;
  lastSeen?: number;
  isConnected?: boolean;
  onPress?: () => void;
  manufacturerId?: string;
}

function SignalIcon({ rssi }: { rssi: number }) {
  const theme = useTheme();
  let name: keyof typeof MaterialCommunityIcons.glyphMap = 'signal-cellular-outline';
  let color = theme.colors.onSurfaceVariant;
  
  if (rssi >= -55) {
    name = 'signal-cellular-3';
    color = '#34C759';
  } else if (rssi >= -65) {
    name = 'signal-cellular-2';
  } else if (rssi >= -75) {
    name = 'signal-cellular-1';
  }

  return <MaterialCommunityIcons name={name} size={18} color={color} />;
}

function formatLastSeen(timestamp?: number) {
  if (!timestamp) return '';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function DeviceCard({
  name,
  id,
  rssi,
  lastSeen,
  isConnected,
  onPress,
  manufacturerId,
}: DeviceCardProps) {
  const theme = useTheme();
  const statusColor = isConnected ? '#34C759' : theme.colors.onSurfaceVariant;

  return (
    <Card style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: theme.colors.surface }}>
      <TouchableRipple onPress={onPress} style={{ borderRadius: 12 }}>
        <Card.Content style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
          <View style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 24, 
            backgroundColor: theme.colors.primaryContainer, 
            justifyContent: 'center', 
            alignItems: 'center',
            marginRight: 16
          }}>
            <Image source="sf:wave.3.right" contentFit="contain" style={{ width: 24, height: 24, tintColor: isConnected ? '#34C759' : theme.colors.primary }} />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{name}</Text>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{id}</Text>
              {manufacturerId && (
                <View style={{ backgroundColor: theme.colors.secondaryContainer, paddingHorizontal: 6, borderRadius: 4 }}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSecondaryContainer, fontSize: 10, fontWeight: 'bold' }}>
                    ID: {manufacturerId.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            {!isConnected && lastSeen && (
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                 Seen: {formatLastSeen(lastSeen)}
              </Text>
            )}
          </View>

          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            {rssi !== undefined && <SignalIcon rssi={rssi} />}
            {isConnected ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#34C75915', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                 <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759', marginRight: 4 }} />
                 <Text variant="labelSmall" style={{ color: '#34C759', fontWeight: 'bold' }}>Connected</Text>
              </View>
            ) : (
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
            )}
          </View>
        </Card.Content>
      </TouchableRipple>
    </Card>
  );
}
