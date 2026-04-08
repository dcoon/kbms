import { Device, useBleContext } from '@/components/ble-provider';
import { uilog as log } from '@/services/log';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Appbar, Button, useTheme } from 'react-native-paper';

import { DeviceCard } from '@/components/device-card';
import DeviceListHeader, { SortButtonDefinition, SortKey, SortOrder } from '@/components/device-list-header';
import { EventType, useEventBusContext } from '@/components/event-bus-provider';
import { useSettingsContext } from '@/components/settings-provider';
import { DeviceFavorite, UserSettings } from '@/constants/user-settings';
import { DeviceId } from '@/services/ble-service';

// type SortBy = 'name' | 'rssi' | 'lastSeen';
// type SortOrder = 'asc' | 'desc';
const LOG_SRC = "DevicesScreen";

const sortButtons: SortButtonDefinition[] = [
  { sortKey: 'name', label: 'Name' },
  { sortKey: 'rssi', label: 'Signal' },
  { sortKey: 'id', label: 'ID' },
];

export default function DevicesScreen() {
  const ble = useBleContext();
  const settings = useSettingsContext<UserSettings>();
  const eventBus = useEventBusContext();
  const theme = useTheme();


  const [devices, setDevices] = useState<Device[]>([]);
  const [favorites, setFavorites] = useState<DeviceFavorite[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [sortKey, setSortKey] = React.useState<SortKey>('name');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const [sortFilter, setSortFilter] = React.useState<string>('all');

  // const initializeFavorites = useEffect(() => {
  //   log.debug("DevicesScreen: Initializing favorites from settings: ", settings?.favorites);
  //   if (settings?.favorites) {

  //     const favoriteDevices = settings.favorites.map((favorite) => { const d = new Device({ id: favorite.id, name: favorite.name }); d.isFavorite = true; return d; }); // Create Device objects with isFavorite set to true
  //     setFavorites(favoriteDevices);
  //   }
  // }, [settings]);

  const subscribeToNotifications = useEffect(() => {
    const subscription = eventBus && eventBus.subscribe((notification) => {
      // log.debug("Received notification: ", notification);
      // Handle the notification as needed
      if (notification.type === EventType.DeviceScanned) {
        const device = notification.data as Device;
        onDeviceFound(device);
      } else if (notification.type === EventType.SettingsChanged) {
        const [key, value, newSettings] = notification.data;
        onSettingsChanged(key, value, newSettings);
      }

    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [eventBus]);

  const sortedDevices = useMemo(() => {

    return [...devices]
    .filter(device => {
      if (sortFilter === 'all') {
        return true;
      }

      log.error("TODO: filter by known service uuids");
      return favorites.findIndex(fav => fav.id === device.id) !== -1;
    })
    .sort((a, b) => {

      let valueA = a[sortKey as keyof Device];
      let valueB = b[sortKey as keyof Device];

      // log.debug(`Sorting by ${sortKey} in ${sortOrder} order. Comparing ${valueA} and ${valueB}`);

      if (valueA && valueB) {
        if (sortOrder === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;

        } else {
          return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
        }
      } else {
        return 0;
      }
    });

  }, [devices, sortKey, sortOrder, sortFilter, favorites]);

  const onSort = (key: SortKey, order: SortOrder, filter: string) => {
    log.debug("Sorting by", key, order, filter, sortFilter);

    if (sortKey !== key) {
      setSortKey(key);
    } else if (filter !== sortFilter) {
      setSortFilter(filter);
    } else {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

    }

  };


  const onDeviceFound = useCallback((device: Device) => {
    log.info(LOG_SRC, "onDeviceFound called with device: ", device.id, device.name);


    setDevices(prevDevices => {
      const existingDeviceIndex = prevDevices.findIndex((d) => d.id === device.id);
      if (existingDeviceIndex < 0) {
        log.debug("Adding new device to list: ", device.id, device.name);
        return [...prevDevices, device] as Device[];
      } else {
        log.debug("Device already known, updating: ", device.id, device.name);
        const updatedDevices = [...prevDevices];
        updatedDevices[existingDeviceIndex] = device;
        return updatedDevices;
      }
    });

  }, []);

  const onSettingsChanged = useCallback((key?: string, value?: any, newSettings?: UserSettings) => {
    log.debug("onSettingsChanged: ", key, value, newSettings);


    const newFavorites = key === 'favorites' && value !== undefined ? value : newSettings?.favorites;

    if (newFavorites !== favorites) {
      setFavorites(newFavorites);
    }

  }, []);



  const onScanButtonPress = (): void => {

    log.info('Scan button pressed. Current scanning state:', isScanning);

    if (isScanning) {
      setIsScanning(false);
      ble?.stopScanning()
    } else {
      setIsScanning(true);
      ble?.scanForDevices()
    }

  }

  const onDevicePress = useCallback((deviceId: DeviceId) => {
    log.info('onDevicePress called with device ID:', deviceId);

    if (deviceId) {
      ble?.stopScanning();

      setIsScanning(false);
      router.push({
        pathname: '/devices/[id]',
        params: {
          id: deviceId,
        }
      })
    } else {
      log.warn('Device ID is missing, cannot navigate to detail screen');
    }
  }, []);



  function ListHeader() {
    return (
      <DeviceListHeader
        buttons={sortButtons}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={onSort}
        filter={sortFilter}
      />
    );
  }

  function ListEmptyComponent() {
    return (
      <Button>No devices found</Button>
    );
  }

  return (
    <SafeAreaView>
      <Appbar.Header>
        <Appbar.Content title="Devices" />
        <Appbar.Action icon={isScanning ? "stop" : "sync"} onPress={onScanButtonPress} />
        <Appbar.BackAction onPress={() => router.back()} />
      </Appbar.Header>

      <FlatList
        data={sortedDevices}
        renderItem={({ item }) => <DeviceCard
          device={item}
          isFavorite={favorites.some(favorite => favorite.id === item.id)}
          onDevicePress={onDevicePress}
        />}
        keyExtractor={item => item.id}
        refreshing={isScanning}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeader}

      />

    </SafeAreaView>
  );
}


