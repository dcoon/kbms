import { Image } from 'expo-image';
import { Stack, useGlobalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { Card, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBleContext } from '@/components/ble-provider';
import { StatusCard } from '../../components/status-card';
import { BatteryData } from '../../constants/battery-types';
import { MOCK_BATTERY_DATA } from '../../constants/mock-data';
// import { useBLE } from '../../hooks/use-ble';

export default function DeviceDetailScreen() {
  const ble = useBleContext();

  const { id } = useGlobalSearchParams();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  // const { connectedDevice, batteryData, connectToDevice } = useBLE();
  const [batteryData, setBatteryData] = useState<BatteryData>(MOCK_BATTERY_DATA);

  // Connection logic
  useEffect(() => {
    if (id) {
      const deviceId = typeof id === 'string' ? id : id[0];
      console.info("Attempting to connect to device with ID: ", deviceId);
      ble?.connectToBattery(deviceId, (data) => {
        console.info("Received battery update from BLE service: ", data);
        setBatteryData(data);
      });
    }
  }, [id]);

  // BLE Update and Mock Simulation
  // useEffect(() => {
  //   const deviceId = (id || nativeDevice) as string;
  //   // Only use BLE data on real devices when the IDs match
  //   if (ExpoDevice.isDevice && connectedDevice && connectedDevice.id === deviceId) {
  //     setBatteryData(prev => ({
  //       ...prev,
  //       soc: batteryData.soc > 0 ? batteryData.soc : prev.soc,
  //       voltage: batteryData.voltage > 0 ? batteryData.voltage : prev.voltage,
  //       current: batteryData.current !== 0 ? batteryData.current : prev.current,
  //       temperature: batteryData.temperature !== 0 ? batteryData.temperature : prev.temperature,
  //     }));
  //     return;
  //   }

  //   // Default simulation for emulators OR disconnected real devices
  //   const interval = setInterval(() => {
  //     setBatteryData(prev => ({
  //       ...prev,
  //       voltage: +(prev.voltage + (Math.random() * 0.1 - 0.05)).toFixed(2),
  //       current: +(prev.current + (Math.random() * 0.5 - 0.25)).toFixed(2),
  //       soc: Math.max(0, Math.min(100, +(prev.soc + (Math.random() * 0.1 - 0.05)).toFixed(1))),
  //     }));
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, [connectedDevice, batteryData, id, nativeDevice]);

  const getStatusColor = (status: BatteryData['status']) => {
    switch (status) {
      case 'Healthy': return '#34C759';
      case 'Warning': return '#FF9500';
      case 'Critical': return '#FF3B30';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const displayName =  id  || 'Battery Monitor';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: "Device Details", headerShown: true }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {"Connected Device"}
            </Text>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>{displayName}</Text>
          </View>
          <View style={{ backgroundColor: getStatusColor(batteryData.status) + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
            <Text variant="labelSmall" style={{ color: getStatusColor(batteryData.status), fontWeight: 'bold' }}>{batteryData.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Main SOC Card */}
        <Card style={{ margin: 20, backgroundColor: theme.colors.surface, borderRadius: 24 }} elevation={2}>
          <Card.Content style={{ padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>State of Charge</Text>
              <Image source="sf:battery.100" style={{ width: 20, height: 20, tintColor: theme.colors.onSurfaceVariant }} />
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 }}>
              <Text style={{ fontSize: 72, fontWeight: '800', color: theme.colors.onSurface, fontVariant: ['tabular-nums'] }}>{batteryData.soc}</Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>%</Text>
            </View>
            
            <View style={{ height: 12, backgroundColor: theme.colors.surfaceVariant, borderRadius: 6, overflow: 'hidden' }}>
              <View style={{ width: `${batteryData.soc}%`, height: '100%', backgroundColor: getStatusColor(batteryData.status) }} />
            </View>
          </Card.Content>
        </Card>

        {/* Grid of Status Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 8 }}>
          <StatusCard
            label="Voltage"
            value={batteryData.voltage}
            unit="V"
            icon="sf:bolt.fill"
            color="#007AFF"
          />
          <StatusCard
            label="Current"
            value={batteryData.current}
            unit="A"
            icon="sf:arrow.left.and.right.circle.fill"
            color="#5856D6"
          />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 20 }}>
          <StatusCard
            label="Temperature"
            value={batteryData.temperature}
            unit="°C"
            icon="sf:thermometer.medium"
            color="#FF9500"
          />
          <StatusCard
            label="Capacity"
            value={batteryData.capacity}
            unit="Ah"
            icon="sf:battery.100.bolt"
            color="#34C759"
          />
        </View>

        {/* Health Summary Card */}
        <Card style={{ margin: 20, backgroundColor: theme.colors.surface, borderRadius: 20 }} elevation={1}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>System Health</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Surface style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: theme.colors.secondaryContainer, justifyContent: 'center', alignItems: 'center', marginRight: 16 }} elevation={0}>
                <Image source="sf:arrow.2.squarepath" contentFit="contain" style={{ width: 24, height: 24, tintColor: theme.colors.secondary }} />
              </Surface>
              <View>
                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>{batteryData.cycles}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Charge Cycles</Text>
              </View>
            </View>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 20 }}>
              Your battery is in excellent condition. Low cycle count indicates a relatively new or well-maintained cell. Regular monitoring ensures optimal performance.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
