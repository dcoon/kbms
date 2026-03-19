import { Device, DeviceId } from '@/services/ble-service';
import { uilog as log } from '@/services/log';
import React, { useMemo } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { DeviceCard } from './device-card';
import DeviceListHeader, { SortButtonDefinition, SortKey, SortOrder } from './device-list-header';


interface DeviceListProps {
  devices: Device[];
  favorites?: DeviceId[];
  onDevicePress: (deviceId: DeviceId) => void;
  onFavoritePress: (deviceId: DeviceId) => void;
  isScanning: boolean;
  onScanButtonPress?: () => void;
}


/**
 * DeviceList component with sorting capabilities.
 */
export const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  favorites,
  onDevicePress,
  onFavoritePress,
  isScanning,
  onScanButtonPress
}) => {

  const sortButtons: SortButtonDefinition[] = [
    { sortKey: 'name', label: 'Name' },
    { sortKey: 'rssi', label: 'Signal' },
    {sortKey: 'id', label: 'ID'},
  ];

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


  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={{ flex: 1 }}
        data={sortedDevices}
        keyExtractor={(item) => item.id || ""}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onScanButtonPress}/>}
        renderItem={({ item }) => (
          <DeviceCard
            device={item}
            isFavorite={favorites?.some(fav => fav === item.id) ?? false}
            onDevicePress={onDevicePress}
            onFavoritePress={onFavoritePress}
          />
        )}
        ListHeaderComponent={() => (
          <View>
            <DeviceListHeader
              buttons={sortButtons}
              sortKey={sortKey}
              sortOrder={sortOrder}
              onSort={onSort}
            />

            <Text variant="titleSmall">
              {isScanning ? 'Scanning...' : 'Devices'} ({devices.length})
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View>
            <Text variant="bodyMedium">No devices found.</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View />}

      />
      <View >
        <View>
          <Button
            mode="contained-tonal"
            onPress={onScanButtonPress}
          >
            {isScanning ? "Stop Scanning" : "Scan for Devices"}
          </Button>
        </View>
      </View>

    </View>
  );
};

