import { Device, useBleContext } from '@/components/ble-provider';
import { uilog as log } from '@/services/log';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Appbar, Button, useTheme } from 'react-native-paper';

import { DeviceCard } from '@/components/device-card';
import DeviceListHeader, { SortButtonDefinition, SortKey, SortOrder } from '@/components/device-list-header';
import { useSettingsContext } from '@/components/settings-provider';
import { DeviceId } from '@/services/ble-service';

// type SortBy = 'name' | 'rssi' | 'lastSeen';
// type SortOrder = 'asc' | 'desc';

  const sortButtons: SortButtonDefinition[] = [
    { sortKey: 'name', label: 'Name' },
    { sortKey: 'rssi', label: 'Signal' },
    {sortKey: 'id', label: 'ID'},
  ];

export default function DevicesScreen() {
  const ble = useBleContext();
  const settings = useSettingsContext();
  const theme = useTheme();


  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [sortKey, setSortKey] = React.useState<SortKey>('name');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');

  const sortedDevices = useMemo(() => {

    return [...devices].sort((a, b) => {

      let valueA = a[sortKey as keyof Device];
      let valueB = b[sortKey as keyof Device];

      // log.debug(`Sorting by ${sortKey} in ${sortOrder} order. Comparing ${valueA} and ${valueB}`);

      if(valueA && valueB) {
        if(sortOrder === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;

        } else {
          return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;}
      } else {
        return 0;
      }
    });

  }, [devices, sortKey, sortOrder]);

  const onSort = (key: SortKey, order: SortOrder) => {
    log.debug("Sorting by ", key, " in order ", order);

    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      // setSortOrder('asc');
    }
  };


  const onDeviceFound = useCallback((device: Device) => {
    log.info("onDeviceFound called with device: ", device.id, device.name, isScanning);


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


  const onScanButtonPress = (): void => {

    log.info('Scan button pressed. Current scanning state:', isScanning);

    if (isScanning) {
      setIsScanning(false);
      ble?.stopScanning()
    } else {
      setIsScanning(true);
      ble?.scanForDevices((d) => { onDeviceFound(d); }, (e) => { console.error(e); })
    }

  }

  const onDevicePress = useCallback((deviceId: DeviceId) => {
    log.info('onDevicePress called with device ID:', deviceId);

    if (deviceId) {
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

  const onRefresh = useCallback(() => {
    setIsScanning(true);
    ble?.scanForDevices(onDeviceFound, (error) => {
      log.error("Error scanning for devices: ", error);
    });
  }, [ble, onDeviceFound]);



  function ListHeader() {
    return (
      <DeviceListHeader
        buttons={sortButtons}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={onSort}
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
        renderItem={({ item }) => <DeviceCard device={item} 
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


