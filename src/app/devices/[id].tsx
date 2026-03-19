import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { Appbar, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBleContext } from '@/components/ble-provider';
import { Device, DeviceId } from '@/services/ble-service';

import { DeviceCard } from '@/components/device-card';
import { FavoriteIcon } from '@/components/favorite-icon';
import { uilog as log } from '@/services/log'; // import log from '@/services/log';
import { StatusCard } from '../../components/status-card';
// import { BatteryData } from '../../constants/battery-types';
// import { MOCK_BATTERY_DATA } from '../../constants/mock-data';
// import { useBLE } from '../../hooks/use-ble';


export default function DeviceDetailScreen() {
  const ble = useBleContext();
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [device, setDevice] = useState<Device>();

  useEffect(() => {
    if (id) {
      const deviceId = id as DeviceId;
      console.info("Attempting to connect to device with ID: ", deviceId);
      ble?.connectToBattery(deviceId, (device) => {
        log.info("Successfully connected to device: ", device.id, device.name);
        setDevice(device);
      });
    }
  }, [id, ble]);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Healthy': return '#34C759';
      case 'Warning': return '#FF9500';
      case 'Critical': return '#FF3B30';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  function getProgressBarColor(value: number | undefined, maxValue: number, minValue: number = 0) {

    if (value === undefined) return theme.colors.onSurfaceVariant;
    const percentage = (value - minValue) / (maxValue - minValue) * 100;
    if (percentage < 30) return '#FF3B30'; // Critical
    if (percentage < 70) return '#FF9500'; // Warning
    return '#34C759'; // Healthy
  }

  const batteryData = device?.batteryInfo;


  function onFavoritePress(deviceId: DeviceId | undefined) {
    log.debug("onFavoritePress called with device ID: ", deviceId);

  }

  function LeftContent() {
    return (
      <View>
        <FavoriteIcon deviceId={device?.id} isFavorite={device?.isFavorite} onFavoritePress={(deviceId) => onFavoritePress(deviceId)} />
      </View>
    );
  }

  function RightContent() {
    return (
      <View>
        <View style={{ backgroundColor: getStatusColor(batteryData?.status) + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
          <Text variant="labelSmall" style={{ color: getStatusColor(batteryData?.status), fontWeight: 'bold' }}>{batteryData?.status?.toUpperCase()}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={device?.name || device?.id} />
      </Appbar.Header>
      <ScrollView contentInsetAdjustmentBehavior="automatic">

        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <DeviceCard device={device} isFavorite={device?.isFavorite} />

          <List.AccordionGroup>
            <List.Subheader>Battery Information</List.Subheader>
            <List.Accordion
              id="device-info"
              title="Status"
              left={() => <List.Icon icon="car-battery" 
              />

              }
            >
              <StatusCard
                label="State of Charge (SOC) %"
                value={batteryData?.soc}
                maxValue={100}
                unit="%"
                icon="battery-high"
                color={getProgressBarColor(batteryData?.soc, 100)}
              />
              <StatusCard
                label="Voltage"
                value={batteryData?.voltage}
                unit="V"
                icon="flash-triangle-outline"
                color="#007AFF"
              />
              <StatusCard
                label="Current"
                value={batteryData?.current}
                unit="A"
                icon="current-dc"
                color="#5856D6"
              />
              <StatusCard
                label="Temperature"
                value={batteryData?.temperature}
                unit="°C"
                icon="thermometer"
                color="#FF9500"
              />
              <StatusCard
                label="Cycles"
                value={batteryData?.cycles}
                unit="cycles"
                icon="chart-donut"
                color="#34C759"
              />
            </List.Accordion>

            <List.Accordion
              id="device-cells"
              title="Cells"
              left={() => <List.Icon icon="battery-high" />}
            >
              <List.Item
                title="Cell 1 Voltage"
                description="Voltage of cell 1"
                left={() => <List.Icon icon="flash-triangle-outline" color="green" />}
                right={() => (
                  <Text variant="bodyMedium">{true ? `${13.7} V` : 'N/A'}</Text>
                )}
                style={{ backgroundColor: '#34C75915', marginVertical: 4, borderRadius: 8 }}
              />

            </List.Accordion>

            <List.Accordion
              id="device-details"
              title="Information"
              left={() => <List.Icon icon="information-outline" />}
            >
              <StatusCard
                label="Name"
                value={device?.name}
                icon="information-outline"
                color="#34C759"
              />
              <StatusCard
                label="Capacity"
                value={batteryData?.capacity}
                unit="Ah"
                icon="car-battery"
                color="#34C759"
              />
              <StatusCard
                label="Signal"
                value={device?.rssi}
                unit="dBm"
                icon="signal-cellular-outline"
                color="#34C759"
              />

            </List.Accordion>
          </List.AccordionGroup>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
