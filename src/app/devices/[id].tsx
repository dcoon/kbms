import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Appbar, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBleContext } from '@/components/ble-provider';
import { BatteryData, Device, DeviceId } from '@/services/ble-service';

import { DeviceCard } from '@/components/device-card';
import { EventType, useEventBusContext } from '@/components/event-bus-provider';
import { useSettingsContext } from '@/components/settings-provider';
import { UserSettings } from '@/constants/user-settings';
import { uilog as log } from '@/services/log'; // import log from '@/services/log';
import { StatusCard } from '../../components/status-card';

const LOG_SRC = "DeviceDetailScreen";

export default function DeviceDetailScreen() {
  const ble = useBleContext();
  const settings = useSettingsContext<UserSettings>();
  const eventBus = useEventBusContext();
  const { id } = useLocalSearchParams() as { id: string };
  const theme = useTheme();
  // const { width } = useWindowDimensions();

  const [device, setDevice] = useState<Device>();
  const [batteryData, setBatteryData] = useState<BatteryData>();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const initializeIsFavorite = useEffect(() => {
    log.debug("Initializing isFavorite state for device ID: ", id);
    if (id && settings) {
      const favorite = settings.favorites.findIndex(fav => fav.id === id);
      setIsFavorite(favorite !== -1);
    }
  }, [settings, id]);

  const subscribeToNotifications = useEffect(() => {
    log.debug("DeviceDetailScreen subscribing to notifications for device ID: ", id);
    const subscription = eventBus.subscribe((notification) => {
      // log.debug("DeviceDetailScreen Received notification: ", typeof notification, notification instanceof BatteryData, notification instanceof Device);
      // Handle the notification as needed
      if (notification.type === EventType.SettingsChanged) {
        const [key, value, newSettings] = notification.data;
        onSettingsChanged(key, value, newSettings);

      } else if (notification.type === EventType.BatteryUpdate) {
        const data = notification.data as BatteryData;
        onBatteryUpdate(data);
        
      } else if (notification.type === EventType.DeviceScanned) {
        const device = notification.data as Device;
        onDeviceFound(device);
      }
    

      return () => {
        subscription?.unsubscribe();
      }

    });

    }, [eventBus, id]);

    const onSettingsChanged = useCallback((key?: string, value?: any, newSettings?: UserSettings) => {
      log.debug("DeviceDetailScreen onSettingsChanged: ", key, value, newSettings);
          log.debug("onSettingsChanged: ", key, value, newSettings);
      
      
          const newFavorites = key === 'favorites' && value !== undefined ? value : newSettings?.favorites;
          const isFavorite = newFavorites?.findIndex((fav: Device) => fav.id === id) !== -1;
      
            setIsFavorite(isFavorite);
      
      
      
    }, [settings]);

    const onDeviceFound = useCallback((device: Device) => {
      log.info(LOG_SRC, ": onDeviceFound called with device: ", device.id, device.name);
      if (device.id === id) {
        setDevice(device);
      }
    }, [id]);

    const onBatteryUpdate = useCallback((batteryData: BatteryData) => {
      log.debug("Received battery update for device ID: ", batteryData.deviceId, batteryData);
      if (batteryData.deviceId === id) {
        setBatteryData(batteryData);
      }
    }, [id]);

    const connectToDevice = useEffect(() => {
      if (ble && id) {
        const deviceId = id as DeviceId;
        ble.connectToBattery(deviceId);
      }

      
    }, [ble, id]);

    enum BatteryStatus {
      Healthy = 0,
      Warning = 1,
      Critical = 2,
    }

  const getStatusColor = (status: number | undefined) => {
    switch (status) {
      case BatteryStatus.Healthy: return '#34C759';
      case BatteryStatus.Warning: return '#FF9500';
      case BatteryStatus.Critical: return '#FF3B30';
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



  // function LeftContent() {
  //   return (
  //     <View>
  //       <FavoriteIcon deviceId={device?.id} isFavorite={device?.isFavorite} onFavoritePress={(deviceId) => onFavoritePress(deviceId)} />
  //     </View>
  //   );
  // }

  // function RightContent() {
  //   return (
  //     <View>
  //       <View style={{ backgroundColor: getStatusColor(batteryData?.status) + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
  //         <Text variant="labelSmall" style={{ color: getStatusColor(batteryData?.status), fontWeight: 'bold' }}>{batteryData?.status}</Text>
  //       </View>
  //     </View>
  //   );
  // }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={device?.name || device?.id} />
      </Appbar.Header>
      <ScrollView contentInsetAdjustmentBehavior="automatic">

        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <DeviceCard device={device ? device : new Device({id: id, name: 'Loading...'})} batteryData={batteryData} isFavorite={isFavorite} />

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
