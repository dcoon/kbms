import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Device } from 'react-native-ble-plx';
import { Text } from 'react-native-paper';
import { DeviceCard } from './device-card';
import DeviceListHeader, { SortKey, SortOrder } from './device-list-header';


interface DeviceListProps {
  devices: (Device | Partial<Device>)[];
  onDevicePress?: (device: Device | Partial<Device>) => void;
  isScanning?: boolean;
}


/**
 * DeviceList component with sorting capabilities.
 */
export const DeviceList: React.FC<DeviceListProps> = ({ 
  devices, 
  onDevicePress,
  isScanning = false 
}) => {

  const [sortKey, setSortKey] = React.useState<SortKey>('name');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');

  const sortedDevices = useMemo(() => {
    return [...devices].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sortKey === 'name') {
        valA = (a.name || a.localName || '').toLowerCase();
        valB = (b.name || b.localName || '').toLowerCase();
      } else {
        valA = a.rssi ?? -999;
        valB = b.rssi ?? -999;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [devices, sortKey, sortOrder]);

  const onSort = ({ key, order }: { key: SortKey; order: SortOrder }) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

    // const onSort = useMemo(() => {
    //   return [...devices].sort((a, b) => {
    //     let valA: string | number = '';
    //     let valB: string | number = '';

    //     if (sortBy === 'name') {
    //       valA = (a.name || a.localName || '').toLowerCase();
    //       valB = (b.name || b.localName || '').toLowerCase();
    //     } else {
    //       valA = a.rssi ?? -999;
    //       valB = b.rssi ?? -999;
    //     }

    //     if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    //     if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    //     return 0;
    //   });
    // }, [devices, sortBy, sortOrder]);

  // const toggleSortOrder = () => {
  //   setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  // };

  return (
    <View style={styles.container}>

    <DeviceListHeader
      onSort={onSort}
      sortKey={sortKey}
      sortOrder={sortOrder}
    />

      <FlatList
        data={sortedDevices}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => (
          <DeviceCard 
            device={item} 
            onPress={onDevicePress} 
          />
        )}
        ListHeaderComponent={() => (
          <Text variant="titleSmall" style={styles.header}>
            {isScanning ? 'Scanning...' : 'Devices'} ({devices.length})
          </Text>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text variant="bodyMedium">No devices found.</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  sortSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlLabel: {
    color: '#666',
  },
  segmentedButtons: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    color: '#666',
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
});
