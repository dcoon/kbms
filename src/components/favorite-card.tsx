import { Device } from '@/services/ble-service';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';
import { Card, TouchableRipple, useTheme } from 'react-native-paper';

export interface FavoriteCardProps {
  device: Device;
  onDevicePress: (device: Device) => void;
  onFavoriteDelete?: (device: Device) => void; // Optional callback for deleting favorite
}

const ICON_FAVORITE = "heart";
const ICON_NOT_FAVORITE = "heart-outline";


export function FavoriteCard({
  device,
  onDevicePress,
  onFavoriteDelete
}: FavoriteCardProps) {
  const theme = useTheme();
  const statusColor = device.isConnected ? '#34C759' : theme.colors.onSurfaceVariant;



  function favoriteIcon() {
    return (
      <Pressable onPress={() => onFavoriteDelete?.(device)} style={{ padding: 8 }}>
              <MaterialCommunityIcons name={ICON_FAVORITE} size={20} color={statusColor} />
      </Pressable>
    );
  } 

  return (
      <TouchableRipple onPress={() => onDevicePress(device)} style={{ borderRadius: 12 }}>

    <Card style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: theme.colors.surface }}>
        <Card.Title title={device.name} subtitle={device.id} left={() => favoriteIcon()}  right={() => <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />}/>

    </Card>
        </TouchableRipple>

  );
}
