import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import * as ExpoDevice from 'expo-device';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, Button, Chip } from 'react-native-paper';

import { DeviceCard } from '../../components/device-card';
import { useBLE } from '../../hooks/use-ble';

type SortBy = 'name' | 'rssi' | 'lastSeen';
type SortOrder = 'asc' | 'desc';

export default function DevicesScreen() {
  const theme = useTheme();
  const {
    allDevices,
    requestPermissions,
    scanForDevices,
    stopScanning,
  } = useBLE();
  const [isScanning, setIsScanning] = useState(false);
  const [mockDevices, setMockDevices] = useState<{id: string, name: string, rssi: number, lastSeen: number}[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const sortedDevices = useMemo(() => {
    const source = ExpoDevice.isDevice ? allDevices : mockDevices;
    return [...source].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        const nameA = a.name || a.localName || 'Unnamed Device';
        const nameB = b.name || b.localName || 'Unnamed Device';
        comparison = nameA.localeCompare(nameB);
      } else if (sortBy === 'rssi') {
        comparison = (a.rssi || 0) - (b.rssi || 0);
      } else if (sortBy === 'lastSeen') {
        comparison = (a.lastSeen || 0) - (b.lastSeen || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [ExpoDevice.isDevice, allDevices, mockDevices, sortBy, sortOrder]);

  const scanForDevicesHandler = useCallback(async () => {
    setIsScanning(true);
    if (!ExpoDevice.isDevice) {
      setTimeout(() => {
        setMockDevices([
          { id: '1', name: 'Smart Battery A', rssi: -59, lastSeen: Date.now() - 5000 },
          { id: '2', name: 'KiloVault Unit B', rssi: -84, lastSeen: Date.now() - 300000 },
          { id: '3', name: 'Solar Storage X', rssi: -45, lastSeen: Date.now() - 60000 },
        ]);
        setIsScanning(false);
      }, 2000);
      return;
    }

    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForDevices();
      setTimeout(() => {
        stopScanning();
        setIsScanning(false);
      }, 10000);
    } else {
      setIsScanning(false);
    }
  }, [requestPermissions, scanForDevices, stopScanning]);

  const onRefresh = useCallback(() => {
    scanForDevicesHandler();
  }, [scanForDevicesHandler]);

  const handleConnect = useCallback((item: any) => {
    router.push({
      pathname: '/devices/[id]',
      params: { id: item.id }
    });
  }, []);

  const toggleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => (
    <DeviceCard
      name={item.name || item.localName || 'Unnamed Device'}
      id={item.id}
      rssi={item.rssi}
      lastSeen={item.lastSeen}
      onPress={() => handleConnect(item)}
    />
  ), [handleConnect]);

  const SortButton = ({ field, label, icon }: { field: SortBy, label: string, icon: string }) => {
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
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isScanning}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            <Text variant="titleMedium" style={{ marginBottom: 4, fontWeight: 'bold' }}>
              {isScanning ? 'Scanning for devices...' : 'Nearby Devices'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
              {!ExpoDevice.isDevice ? 'Showing simulated devices for development' : 'Tap a device to view detailed battery metrics'}
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <SortButton field="name" label="Name" icon="alphabetical" />
              <SortButton field="rssi" label="Signal" icon="signal" />
              <SortButton field="lastSeen" label="Recent" icon="clock" />
            </View>
          </View>
        }
        ListEmptyComponent={!isScanning ? (
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
