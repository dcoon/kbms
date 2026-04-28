import { DeviceListItem } from '@/components/ble/device-list-item';
import { IsScanningAction } from '@/components/ui/app-topbar';
import { LoadableGuard } from '@/components/ui/loadable';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Bluetooth } from '@/services/ble/ble-service';
import { Device } from '@/services/ble/ble-types';
import { uilog as log } from '@/services/log/log-service';
import { DefaultTheme } from '@/theme/theme';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Button, IconButton, SegmentedButtons, Text, useTheme } from 'react-native-paper';

const LOG_SRC = "DevicesScreen";


class SortOption {
  value: string = "";
  ascending: boolean = true;
}

const sortButtons = [
  { value: 'name', label: 'Name' },
  { value: 'rssi', label: 'Signal' },
  { value: 'id', label: 'ID' },
];

class FilterOption {
  showKnownBatteryTypesOnly: boolean = true;
}


function SortButtons({ sortBy, onSortChange }: { sortBy: SortOption, onSortChange: (value: string) => void }) {

  const theme = useTheme() as typeof DefaultTheme;

  return (
    <SegmentedButtons
      value={sortBy.value}
      onValueChange={value => { }}
      density={theme.components.SegmentedButtons.density as any}
      style={theme.components.SegmentedButtons.style}
      theme={theme}
      buttons={
        sortButtons.map(button => ({
          label: button.label,
          value: button.value,
          icon: sortBy.value === button.value ? (sortBy.ascending ? 'arrow-up' : 'arrow-down') : undefined,
          onPress: () => onSortChange(button.value),
          labelStyle: theme.components.SegmentedButtons.buttonStyle,
        }))
      }
    />
  );
}

function FilterButtons({ filterBy, onFilterChange }: { filterBy: FilterOption, onFilterChange: () => void }) {
  const theme = useTheme() as typeof DefaultTheme;

  const filterIcon = filterBy.showKnownBatteryTypesOnly ? 'filter' : 'filter-off';

  return (
    // TODO: fix filter logic
    <IconButton icon={filterIcon} onPress={() => onFilterChange()}  />
  );

}

function ListHeaderComponent({ sortBy, onSortChange, filterBy, onFilterChange }: { sortBy: SortOption, onSortChange: (value: string) => void, filterBy: FilterOption, onFilterChange: () => void }) {
  return (


    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 8}}>
      <FilterButtons filterBy={filterBy} onFilterChange={onFilterChange} />
      <SortButtons sortBy={sortBy} onSortChange={onSortChange} />
    </View>
  );

}

function StartScanningButton() {
  const [isScanningLoadable, setIsScanning] = useAtom(Bluetooth.scanning);
  const isScanning = isScanningLoadable.state === "hasData" && isScanningLoadable.data as boolean;

  // const LOG_PREFIX = LOG_SRC + ": StartScanningButton";
  const msg = isScanning ? "Stop Scanning" : "Start Scanning";

  return (
    <LoadableGuard loadable={isScanningLoadable as any}>
      <Button mode="outlined" onPress={() => {
        setIsScanning(!isScanning);
      }}>
        {msg}
      </Button>
    </LoadableGuard>
  );


}

function ListEmptyComponent() {


  return (
    <View style={{ marginTop: 32, alignItems: 'center' }}>
      <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
        No devices found.
      </Text>
      <StartScanningButton />
    </View>
  );

}



function AppBarActions({ children }: { children?: React.ReactNode }) {

  return (
    <IsScanningAction />
  );
}


function DeviceList() {
  const router = useRouter();
  const [devices] = useAtom(Bluetooth.devices);
  
  const [sortBy, setSortBy] = useState<SortOption>(new SortOption());

  const [filterBy, setFilterBy] = useState<FilterOption>(new FilterOption());


  const sortedDevices = useMemo(() => {
    // const filteredDevices = filterBy.knownBatteryTypesOnly ? batteries : devices;
    // const devicesToBeSorted = filteredDevices ? filteredDevices : [];
    const sorted = [...devices].sort((a, b) => {

      const sortOrder = sortBy.ascending ? 1 : -1;
      switch (sortBy.value) {
        case 'rssi':
          const WORST_RSSI = -999;
          const arssi = a.rssi ?? WORST_RSSI;
          const brssi = b.rssi ?? WORST_RSSI;
          return (arssi - brssi) * sortOrder;
        case 'id':
          const aid = a.id ?? '';
          const bid = b.id ?? '';
          return aid.localeCompare(bid) * sortOrder;
        case 'name':
        default:
          const aname = a.name || a.localName || '';
          const bname = b.name || b.localName || '';
          return aname.localeCompare(bname) * sortOrder;
      }
    });
    return sorted;
  }, [devices, sortBy]);


  function onFilterChange() {
    setFilterBy((prev) => ({ ...prev, showKnownBatteryTypesOnly: !prev.showKnownBatteryTypesOnly }));
  }

  function onSortChange(value: string) {
    if (value === sortBy.value) {
      // If the same sort option is selected, toggle ascending/descending
      const newAscending = !sortBy.ascending;
      // log.debug(LOG_SRC, ": Toggling sort order", sortBy, newAscending);
      setSortBy((options) => ({ ...options, ascending: newAscending }));
    } else {
      // log.debug(LOG_SRC, ": Changing sort option to ", value, sortBy);
      // If a different sort option is selected, set it as the new sort option
      setSortBy((options) => ({ ...options, value: value }));

    }
  }

  function onDevicePress(device: Device): void {

    const LOG_PREFIX = LOG_SRC + ": onDevicePress";

    log.debug(LOG_PREFIX, "called with device: ", device.id);

    if (device.id) {

      router.push({
        pathname: "/devices/[deviceid]",
        params: { deviceid: device.id }
      });
    }
  }


  return (
    <FlatList
      data={sortedDevices}
      keyExtractor={(item) => item.id !== undefined ? item.id : ''}
      renderItem={({ item }) => (
        <DeviceListItem device={item} onDevicePress={() => onDevicePress(item)} hideIfUnknownBatteryType={filterBy.showKnownBatteryTypesOnly} />
      )}
      ListHeaderComponent={() => (
        <ListHeaderComponent sortBy={sortBy} onSortChange={onSortChange} filterBy={filterBy} onFilterChange={onFilterChange} />
      )}
      ListEmptyComponent={() => (
        <ListEmptyComponent />
      )}
    />

  );

}

function StartStopScanningOnFocus({deviceId}: {deviceId?: string}) {
  const [, setIsScanning] = useAtom(Bluetooth.scanning);

  useFocusEffect( 
    useCallback(() => {
      const LOG_PREFIX = LOG_SRC + ": StartStopScanningOnFocus";
      log.info(LOG_PREFIX, "focus effect called, starting scan");
      setIsScanning(true);
      return () => {
        log.info(LOG_PREFIX, "cleanup function called, stopping scan");
        setIsScanning(false);
      };
    }, [])
  );
  return null;
}

// function NavigateToPendingDevice() {
//   const router = useRouter();
//   const [pendingDevice, setPendingDevice] = useAtom(Settings.pendingNavigateDevice);

//   useFocusEffect(
//     useCallback(() => {
//       if (pendingDevice) {
//         const id = pendingDevice;
//         setPendingDevice(null);
//         router.push({
//           pathname: '/devices/[deviceid]',
//           params: { deviceid: id },
//         });
//       }
//     }, [pendingDevice])
//   );
//   return null;
// }

export default function DevicesScreen() {

  return (

    <ScreenLayout title="Devices"
      actions={<AppBarActions />}
    >
      <StartStopScanningOnFocus />
      {/* <NavigateToPendingDevice /> */}
      <DeviceList />
    </ScreenLayout>

  );
}
