import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import * as ExpoDevice from 'expo-device';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, Button, Chip, Banner } from 'react-native-paper';

import { DeviceCard } from '../../components/device-card';
import { useBLE, AugmentedDevice } from '../../hooks/use-ble';

type SortBy = 'name' | 'rssi' | 'lastSeen';
type SortOrder = 'asc' | 'desc';

export default function DevicesScreen() {
  const theme = useTheme();
  const {
    allDevices,
    scanForDevices,
    isScanning,
    error,
  } = useBLE();
  
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Initial scan
  useEffect(() => {
    scanForDevices();
  }, []);

  const sortedDevices = useMemo(() => {
    return [...allDevices].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'rssi') {
        comparison = a.rssi - b.rssi;
      } else if (sortBy === 'lastSeen') {
        comparison = a.lastSeen - b.lastSeen;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [allDevices, sortBy, sortOrder]);

  const onRefresh = useCallback(() => {
    scanForDevices();
  }, [scanForDevices]);

  const handleConnect = useCallback((item: AugmentedDevice) => {
    router.push({
      pathname: '/devices/[id]',
      params: { 
        id: item.id,
        name: item.name,
        isMock: item.isMock ? 'true' : 'false',
        nativeDevice: item.id
      }
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

  const renderItem = useCallback(({ item }: { item: AugmentedDevice }) => (
    <DeviceCard
      name={item.name}
      id={item.id}
      rssi={item.rssi}
      lastSeen={item.lastSeen}
      onPress={() => handleConnect(item)}
      manufacturerId={item.manufacturerId}
    />
  ), [handleConnect]);

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
      
      <Banner
        visible={!!error}
        actions={[
          {
            label: 'Retry',
            onPress: onRefresh,
          },
        ]}
        icon={({ size }) => (
          <Image
            source="sf:exclamationmark.triangle.fill"
            style={{ width: size, height: size, tintColor: theme.colors.error }}
          />
        )}
      >
        {error}
      </Banner>

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
              <SortButton field="name" label="Name" />
              <SortButton field="rssi" label="Signal" />
              <SortButton field="lastSeen" label="Recent" />
            </View>
          </View>
        }
        ListEmptyComponent={!isScanning && !error ? (
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
