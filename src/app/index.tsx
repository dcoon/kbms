import { List } from '@/components/list/list-item';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Favorite, Settings } from '@/services/settings/settings-service';
import { router, useFocusEffect } from 'expo-router';
import { useAtom } from 'jotai';
import { ScrollView } from 'react-native';
import { DeviceId } from 'react-native-ble-plx';
import { Card, List as PaperList, TouchableRipple } from 'react-native-paper';

import { FavoriteCard } from '@/components/ui/favorite-card';
import { isBatteryConnected } from '@/services/ble/battery-service';
import { isBluetoothAvailable } from '@/services/ble/ble-types';
import log from '@/services/log/log-service';
import { useCallback } from 'react';




const LOG_SRC = "HomeScreen";

function useOnDevicePress() {
  const [, setPendingDevice] = useAtom(Settings.pendingNavigateDevice);
  return function onDevicePress(device: DeviceId | any) {
    // Extract ID if a device object is passed (as per DeviceListItem)
    const id = typeof device === 'string' ? device : device?.id;
    const LOG_PREFIX = LOG_SRC + ": onDevicePress";
    if (id) {
      log.debug(LOG_PREFIX, "called with device: ", id);
      // Two-step cross-tab navigation: store target, then switch to devices tab.
      // Direct cross-tab deep navigation resets the Android native tab stack to root.
      setPendingDevice(id);
      router.navigate('/devices');
    }
  };
}


function FavoriteListEmptyComponent() {
  return (
    <TouchableRipple onPress={() => router.push('/devices')}>
      <Card>
        <Card.Title title="No favorite devices yet" />
        <Card.Content>
          <PaperList.Item
            title="Add a device"
            description="Go to the devices tab to add your favorite devices here."
            left={() => <PaperList.Icon icon="heart-outline" />}
            right={() => (
              <List.Icon icon="arrow-right" />
            )}
          />
        </Card.Content>
      </Card>
    </TouchableRipple>
  );
}


function FavoritesAccordion() {

  const [favorites] = useAtom<Favorite[]>(Settings.favorites);
  const onDevicePress = useOnDevicePress();

  return (


    <PaperList.Accordion
      id="favorites"
      title="Favorites"
      description="Favorite devices for quick access"
    >
      <List.StaticList data={favorites}
        renderItem={(info) => (<FavoriteCard favorite={info.item} onDevicePress={onDevicePress} />)}
        keyExtractor={(item: Favorite) => item.id}
        listEmptyComponent={FavoriteListEmptyComponent}
      />
    </PaperList.Accordion>
  );
}


function HomeSummaryAccordion() {
  return (

    <List.Section title="System Overview">
      <PaperList.Item
        title="All Batteries Status"
        description="Placeholder for fancy graphs and stuff"
        left={() => <List.Icon icon="battery" />}
      />
    </List.Section>
  );
}


function HelpOnBluetoothUnsupportedDevices() {

  if (isBluetoothAvailable()) {
    return null;
  }

  return (
    <List.Accordion title="Bluetooth Unavailable" id="help" description="Bluetooth is not supported on this device. Showing mock data instead." >
      <List.Item title="Using Mock Data" description="Using mock data for testing purposes only" icon="help-circle-outline" />
      <List.Item title="Battery" description="Devices named Battery can return battery data" icon="battery" />
      <List.Item title="Devices" description="Devices named Device are not batteries and will cause connection errors for testing" icon="devices" />
      <List.Item title="Connection Errors" description="Clicking on devices with (will cause connection errors) in their name will intentionally cause connection errors for testing" icon="alert-circle" />

    </List.Accordion>
  );
}


function StartStopBatteryConnectedOnFocus({ deviceId }: { deviceId: string }) {

  const [, setIsBatteryConnected] = useAtom(isBatteryConnected(deviceId));

  useFocusEffect(
    useCallback(() => {
      const LOG_PREFIX = LOG_SRC + ": StartStopBatteryConnectedOnFocus";
      log.info(LOG_PREFIX, "focus effect called, connecting to battery", deviceId);
      setIsBatteryConnected(true);
      return () => {
        log.info(LOG_PREFIX, "cleanup function called, disconnecting from battery", deviceId);
        setIsBatteryConnected(false);
      };
    }, [])
  );
  return null;
}


function StartStopFavoritesConnectedOnFocus() {

  const [favorites] = useAtom(Settings.favorites);

  return (
    favorites.map(fav => <StartStopBatteryConnectedOnFocus key={fav.id} deviceId={fav.id} />)
  );
}

export function HomeView() {
  return (<ScrollView>
    <List.AccordionGroup>
      <HomeSummaryAccordion />
      <FavoritesAccordion />
      <HelpOnBluetoothUnsupportedDevices />
      <StartStopFavoritesConnectedOnFocus />
    </List.AccordionGroup>
  </ScrollView>
  );
}

export default function HomeScreen() {

  return (
    <ScreenLayout title="Home">
      <HomeView />
    </ScreenLayout>
  );
}
