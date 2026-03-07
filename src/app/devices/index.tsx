import { Device, useBleContext } from '@/components/ble-provider';
import { uilog as log } from '@/services/log';
import * as ExpoDevice from 'expo-device';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { Button, Chip, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// import { Device } from 'react-native-ble-plx';
import { DeviceCard } from '../../components/device-card';
// import { useBLE, Device } from '../../hooks/use-ble';

type SortBy = 'name' | 'rssi' | 'lastSeen';
type SortOrder = 'asc' | 'desc';

export default function DevicesScreen() {
    const ble = useBleContext();

  const theme = useTheme();
  
  
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [devices, setDevices] = useState<Device[]>([]);

 
  const sortedDevices = useMemo(() => {
    return [...devices].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = (a.name ?? '').localeCompare(b.name ?? '');
      } else if (sortBy === 'rssi') {
        comparison = (a.rssi ?? 0) - (b.rssi ?? 0);
      } else if (sortBy === 'lastSeen') {
        // comparison = a.lastSeen - b.lastSeen;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [devices, sortBy, sortOrder]);


  
  const onDeviceFound = useCallback((device: Device) => {
    log.info("onDeviceFound called with device: ", device.id, device.name);


    setDevices(prevDevices => {
      const i = prevDevices.findIndex((d) => d.id === device.id);
      if (i === -1) {
        log.debug("Adding new device to list: ", device.id, device.name);
        return [...prevDevices, device] as Device[];
      } else {
        const updatedDevices = [...prevDevices];
        updatedDevices[i] = device;
        log.debug("Updating existing device in list: ", device.id, device.name);
        return updatedDevices;
      }
    });
  }, [devices]);

  const onDevicePress = useCallback((device: Device) => {
    log.info('onDevicePress called with device:', device.id, device.name);

    if(device.id) {
    router.push({
      pathname: '/devices/[id]',
      params: { 
        id: device.id,
      } 
    })
    } else {
      log.warn('Device ID is missing, cannot navigate to detail screen');
    }    
  }, []);
  
  const onRefresh = useCallback(() => {
    ble?.scanForDevices(onDeviceFound, (error) => {
      log.error("Error scanning for devices: ", error);
    });
  }, [ble, onDeviceFound]);



  const toggleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const deviceCard = useCallback(({ item }: { item: Device }) => (
    <DeviceCard
      name={item.name ?? 'Unknown Device'}
      id={item.id ?? 'Unknown ID'}
      rssi={item.rssi ?? undefined}
      // lastSeen={item.lastSeen}
      onPress={() => onDevicePress(item)}
      // manufacturerId={item.manufacturerId}
    />
  ), [onDevicePress]);

  const SortButton = ({ field, label }: { field: SortBy, label: string }) => {
    const isActive = sortBy === field;
    const direction = sortOrder === 'asc' ? '↑' : '↓';

    return (
      <Chip 
        selected={isActive} 
        onPress={() => toggleSort(field)}
        style={{ marginRight: 8, backgroundColor: isActive ? theme.colors.primaryContainer : theme.colors.surface }}
        showSelectedOverlay
        compact
      >
        {label}{isActive ? ` ${direction}` : ''}
      </Chip>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: "Scan Devices", headerShown: true }} />
      

      <FlatList
        data={sortedDevices}
        renderItem={deviceCard}
        keyExtractor={(item) => item.id ?? ''}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={ble?.isScanning ? true : false}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            <Text variant="titleMedium" style={{ marginBottom: 4, fontWeight: 'bold' }}>
              {ble?.isScanning ? 'Scanning for devices...' : 'Nearby Devices'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
              {!ExpoDevice.isDevice ? 'Showing simulated devices for development' : 'Tap a device to view detailed battery metrics'}
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <SortButton field="name" label="Name" />
              <SortButton field="rssi" label="Signal" />
              <SortButton field="lastSeen" label="Recent" />
            </View>
          </View>
        }
        ListEmptyComponent={!ble?.isScanning  ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.surfaceVariant, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
               <Image source="sf:antenna.radiowaves.left.and.right" style={{ width: 40, height: 40, tintColor: theme.colors.primary }} />
            </View>
            <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 8 }}>No devices found</Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
              Make sure your battery monitor is powered on and within range.
            </Text>
            <Button mode="contained" onPress={onRefresh}>
              Scan Again
            </Button>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}
