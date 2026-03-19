import { Device, DeviceId } from '@/services/ble-service';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { Card, TouchableRipple, useTheme } from 'react-native-paper';

import { SignalIcon } from '@/components/signal-icon';
import { FavoriteIcon } from './favorite-icon';

export interface DeviceCardProps {
  device?: Device;
  isFavorite?: boolean; // Optional prop to indicate if the device is a favorite
  onDevicePress?: (deviceId: DeviceId) => void;
  onFavoritePress?: (deviceId: DeviceId) => void; // Optional callback for favorite action
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
  device,
  isFavorite,
  onDevicePress,
  onFavoritePress
}: DeviceCardProps) {
  const theme = useTheme();
  const statusColor = device?.isConnected ? '#34C759' : theme.colors.onSurfaceVariant;



    function rightContent() {
      const icon = onDevicePress ? 'chevron-right' : 'battery-unknown';

      return (
        <View style={{ alignItems: 'flex-end' }}>
          <SignalIcon rssi={device?.rssi ?? 0} />
            <MaterialCommunityIcons name={icon} size={20} color={theme.colors.onSurfaceVariant} />
        </View>
      );
    }


    function LeftContent () {
      return (
        <FavoriteIcon deviceId={device?.id} isFavorite={isFavorite} onFavoritePress={onFavoritePress} />
      );
    }
  

  return (
          <TouchableRipple onPress={() => onDevicePress && device?.id && onDevicePress(device.id)} style={{ borderRadius: 12 }}>

    <Card style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: theme.colors.surface }}>
        <Card.Title title={device?.name} subtitle={device?.id} left={LeftContent}  right={() => rightContent()}/>

    </Card>
          </TouchableRipple>

  );
}
