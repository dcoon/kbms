import { BatteryData, Device, DeviceId } from '@/services/ble-service';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { Card, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { SignalIcon } from '@/components/signal-icon';
import { FavoriteIcon } from './favorite-icon';

export interface DeviceCardProps {
  device: Device;
  isFavorite?: boolean;
  batteryData?: BatteryData;
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
  batteryData,
  isFavorite = false,
  onDevicePress,
  onFavoritePress
}: DeviceCardProps) {
  const theme = useTheme();
  const statusColor = device.isConnected ? '#34C759' : theme.colors.onSurfaceVariant;



  function RightContent() {
    const icon = onDevicePress ? 'chevron-right' : 'battery-unknown';

    return (
      <View style={{ alignItems: 'flex-end' }}>
        <SignalIcon rssi={device.rssi ?? 0} />
        {onDevicePress && <MaterialCommunityIcons name={icon} size={20} color={statusColor} />}
      </View>
    );
  }


  function LeftContent() {

    return (
      <View>
      <FavoriteIcon device={device} isFavorite={isFavorite} />
      </View>
    );
  }

  function MainContent() {


    function PlayStop() {
      return (
        <MaterialCommunityIcons name={device.isConnected ? 'stop' : 'play'} size={20} color={theme.colors.onSurfaceVariant} />
      );
    }

    function BatteryDataContent() {
    const soc_icon = batteryData && batteryData.soc ?
      batteryData.soc > 80 ? 'battery-high' : batteryData.soc > 40 ? 'battery-medium' : batteryData.soc > 20 ? 'battery-low' : 'battery-outline' : 'battery-unknown';

    const voltage_icon = "flash-triangle";

      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialCommunityIcons name={soc_icon} size={20} color={theme.colors.onSurfaceVariant} />
        <Text>{batteryData?.soc}%</Text>
        <MaterialCommunityIcons name={voltage_icon} size={20} color={theme.colors.onSurfaceVariant} />
        <Text>{batteryData?.voltage}V</Text>
</View>
      );
    }


      return (
      <Card.Content style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }} >
        {/* <PlayStop /> */}
        {batteryData && <BatteryDataContent />}

      </Card.Content>

      );      
    
  


  }

  return (
    <View>
      <TouchableRipple onPress={() => onDevicePress && device?.id && onDevicePress(device.id)} style={{ borderRadius: 12 }}>

        <Card style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: theme.colors.surface }}>
          <Card.Title title={device.name ? device.name : "Loading..."} subtitle={device.id} left={LeftContent} right={RightContent} />
          <MainContent />
        </Card>
      </TouchableRipple>
    </View>

  );
}
