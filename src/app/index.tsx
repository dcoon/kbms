import { List } from '@/components/list/list-item';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Favorite, Settings } from '@/services/settings/settings-service';
import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { ScrollView } from 'react-native';
import { DeviceId } from 'react-native-ble-plx';
import { Card, List as PaperList, TouchableRipple } from 'react-native-paper';

import { FavoriteCard } from '@/components/ui/favorite-card';
import { Gauge } from '@/components/ui/gauge';
import { isBluetoothAvailable } from '@/services/ble/ble-types';
import log from '@/services/log/log-service';




const LOG_SRC = "HomeScreen";

function onDevicePress(device: DeviceId | any) {
  // Extract ID if a device object is passed (as per DeviceListItem)
  const id = typeof device === 'string' ? device : device?.id;
  const LOG_PREFIX = LOG_SRC + ": onDevicePress";
  if (id) {

    log.debug(LOG_PREFIX, "called with device: ", id);

    router.navigate({
      pathname: '/devices/[deviceid]/battery',
      params: { deviceid: id }
    });
  }
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

  return (
   

    <PaperList.Accordion
    id="favorites" 
      title="Favorites"
      description="Favorite devices for quick access"
    >
    <List.StaticList data={favorites}
      renderItem={(info) => (<FavoriteCard device={info.item} onDevicePress={onDevicePress} />)}
      keyExtractor={(item: Favorite) => item.id}
      listEmptyComponent={FavoriteListEmptyComponent} 
      />
      </PaperList.Accordion>
  );
}


function HomeSummaryAccordion() {
  return (

    <List.Section title="System Overview">
      {/* <PaperList.Item
        title="All Batteries Status"
        description="Placeholder for fancy graphs and stuff"
        left={() => <List.Icon icon="battery" />}
      /> */}
      <Gauge value={75} maxvalue={100} valuesuffix="%" title="SoC" radius={40} thickness={8} />
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


export function HomeView() {
  return (    <ScrollView>
          <List.AccordionGroup>
            <HomeSummaryAccordion />
            <FavoritesAccordion />
            <HelpOnBluetoothUnsupportedDevices />
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
