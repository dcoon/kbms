import { List } from '@/components/list/list-item';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Favorite, Settings } from '@/services/settings/settings-service';
import { router, useFocusEffect } from 'expo-router';
import { useAtom } from 'jotai';
import { ScrollView } from 'react-native';
import { Chip, Icon, useTheme } from 'react-native-paper';

import { BatteryCard, BatteryCardEmpty } from '@/components/battery/battery-card';
import { AddDeviceAction, SettingsAction } from '@/components/ui/topbar-actions';
import { BatteryDataBase, BatteryStatus } from '@/services/battery/battery';
import { batteries, isBatteryConnected } from '@/services/battery/battery-service';
import { DeviceId, isBluetoothAvailable } from "@/services/ble/ble";
import log from '@/services/log/log-service';
import { DefaultTheme } from '@/theme/theme';
import { useCallback } from 'react';

import { BatteryCardLarge } from '@/components/battery/battery-card-large';
const LOG_SRC = "HomeScreen";

function onDevicePress(deviceId: DeviceId) {
  // Extract ID if a device object is passed (as per DeviceListItem)
  const LOG_PREFIX = LOG_SRC + ": onDevicePress";
  log.debug(LOG_PREFIX, "called with device: ", deviceId);

  router.push({
    pathname: '/devices/[deviceid]',
    params: { deviceid: deviceId }
  });
};


function FavoriteListEmptyComponent() {
  return (

    <List.Item
      title="No batteries yet"
      description="Tap here to browse devices and add your first battery"
      left={<List.Icon icon="plus" />}
      onPress={() => router.push('/devices')}
      right={(<List.Icon icon="arrow-right" />)}
    />
  );
}


function FavoritesAccordion() {

  const [favorites] = useAtom<Favorite[]>(Settings.favorites);

  return (


    <List.Section
      id="favorites"
      title="Batteries"
      // description="Saved batteries"
    >
      <List.StaticList 
        data={favorites}
        renderItem={({ item }: { item: Favorite }) => (<BatteryCard deviceOrFavorite={item} onDevicePress={onDevicePress} />)}
        keyExtractor={(item: Favorite) => item.id}
        listEmptyComponent={() => <BatteryCardEmpty onDevicePress={() => router.push('/devices')} />}
      />
    </List.Section>
  );
}

function NumBatteriesReportingChip({ numReporting, numTotal }: { numReporting: number, numTotal: number }) {

  const theme = useTheme() as typeof DefaultTheme;

  if (numReporting === numTotal) {
    return null;
  } else {
    return (
      <Chip
        icon={(props) => <Icon source={theme.icons.alert.source} color={theme.icons.alert.color} size={theme.icons.iconSize} />}
        style={theme.components.Chip.style}
        textStyle={theme.components.Chip.textStyle}
        compact={true}
      >{numReporting}/{numTotal} reporting</Chip>
    );
  }

}


function minDate(a?: Date, b?: Date): Date | undefined {
  if (a && b) {
    return a < b ? a : b; 
  } else {
    return a || b;
  } 
}

function HomeSummaryAccordion() {

  const [favorites] = useAtom<Favorite[]>(Settings.favorites);
  const [bats] = useAtom(batteries(favorites.map(fav => fav.id)));

  const theme = useTheme() as typeof DefaultTheme;

  if (favorites.length === 0) {
    return <BatteryCardLarge battery={undefined} />;
  }


  const cumulative = bats.reduce((acc, bat) => {
    if (bat) {
      acc.soc += bat.soc;
      acc.voltage += bat.voltage;
      acc.current += bat.current;
      acc.watts += bat.voltage / 1000 * bat.current / 1000;
      acc.status = bat.status ?? acc.status;
      acc.lastUpdated = minDate(acc.lastUpdated, bat.lastUpdated);
      acc.total += 1;
    }
    return acc;
  }, { total: 0, soc: 0, voltage: 0, current: 0, watts: 0, status: new BatteryStatus(), lastUpdated: undefined as Date | undefined });

  const summary = {
    ...cumulative,
    soc: cumulative.total > 0 ? cumulative.soc / cumulative.total : 0,
    voltage: cumulative.total > 0 ? cumulative.voltage / cumulative.total : 0,
  };

  const data = new BatteryDataBase(summary);

  return (
    <BatteryCardLarge battery={data}>
      <NumBatteriesReportingChip numReporting={cumulative.total} numTotal={favorites.length} />
    </BatteryCardLarge>
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
      log.debug(LOG_PREFIX, "focus effect called, connecting to battery", deviceId);
      setIsBatteryConnected(true);
      return () => {
        log.debug(LOG_PREFIX, "cleanup function called, but not disconnecting from battery", deviceId);
        // setIsBatteryConnected(false);
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
  return (
    <ScrollView>
      <HomeSummaryAccordion />
      <List.AccordionGroup>
        <FavoritesAccordion />
        <HelpOnBluetoothUnsupportedDevices />
        <StartStopFavoritesConnectedOnFocus />
      </List.AccordionGroup>
    </ScrollView>
  );
}


function AppBarActions({ children }: { children?: React.ReactNode }) {

  return (
    <>
      <SettingsAction />
      <AddDeviceAction />
    </>
  );
}


export default function HomeScreen() {

  return (
    <ScreenLayout title="Home" showBackAction={false} actions={<AppBarActions />}>
      <HomeView />
    </ScreenLayout>
  );
}
