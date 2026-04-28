import { List } from '@/components/list/list-item';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Favorite, Settings } from '@/services/settings/settings-service';
import { router, useFocusEffect } from 'expo-router';
import { useAtom } from 'jotai';
import { ScrollView, View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';

import { socIconSource } from '@/components/ble/battery';
import { BatteryLastSeenIconSource, DeviceOrFavorite } from '@/components/ble/ble';
import { AddDeviceAction, SettingsAction } from '@/components/ui/app-topbar';
import { FavoriteCard } from '@/components/ui/favorite-card';
import { Gauge } from '@/components/ui/gauge';
import { ValueChip } from '@/components/ui/ui-util';
import { BatteryStatus } from '@/services/ble/battery';
import { batteries, isBatteryConnected } from '@/services/ble/battery-service';
import { isBluetoothAvailable } from '@/services/ble/ble-types';
import log from '@/services/log/log-service';
import { DefaultTheme } from '@/theme/theme';
import { formatDistanceToNow } from 'date-fns';
import { useCallback } from 'react';

import { Icon } from 'react-native-paper';
const LOG_SRC = "HomeScreen";

function onDevicePress(device: DeviceOrFavorite) {
  // Extract ID if a device object is passed (as per DeviceListItem)
  const LOG_PREFIX = LOG_SRC + ": onDevicePress";
    log.debug(LOG_PREFIX, "called with device: ", device.id);

  router.push({
    pathname: '/devices/[deviceid]',
    params: { deviceid: device.id }
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
      description="Your favorite batteries for quick access"
    >
      <List.StaticList data={favorites}
        renderItem={(info) => (<FavoriteCard favorite={info.item} onDevicePress={onDevicePress} />)}
        keyExtractor={(item: Favorite) => item.id}
        listEmptyComponent={FavoriteListEmptyComponent}
      />
    </List.Section>
  );
}


function HomeSummaryAccordion() {

  const [favorites] = useAtom<Favorite[]>(Settings.favorites);
  const [bats] = useAtom(batteries(favorites.map(fav => fav.id)));

  const theme = useTheme() as typeof DefaultTheme;

  const cumulative = bats.reduce((acc, batteryData) => {
    if (batteryData) {
      acc.soc += batteryData.soc;
      acc.voltage += batteryData.voltage;
      acc.current += batteryData.current;
      acc.watts += batteryData.voltage / 1000 * batteryData.current / 1000;
      acc.status = batteryData.status ?? acc.status;
      acc.lastUpdated = batteryData.lastUpdated < acc.lastUpdated ? batteryData.lastUpdated : acc.lastUpdated;
      acc.total += 1;
    }
    return acc;
  }, { total: 0, soc: 0, voltage: 0, current: 0, watts: 0, status: new BatteryStatus(), lastUpdated: new Date(Date.now()) });

  const summary = {
    ...cumulative,
    soc: cumulative.total > 0 ? cumulative.soc / cumulative.total : 0,
    voltage: cumulative.total > 0 ? cumulative.voltage / cumulative.total : 0,
  };

  const lastSeen = summary.lastUpdated ? formatDistanceToNow(summary.lastUpdated, { addSuffix: true }) : "Connecting...";
  const lastSeenIconSource = BatteryLastSeenIconSource(summary.lastUpdated, theme);


  const socIS = socIconSource({ soc: summary.soc, charging: summary.current < 0, theme });
  const strokeColor = socIS.color;

  return (
    <Card theme={theme.components.PrimaryCard.theme as any} >
      <Card.Title title="System Summary"
        // left={(props) => <SoCIcon soc={summary.soc} current={summary.current} size={props.size} />}
        // left={(props) => <Icon source={theme.icons.system.source} size={theme.icons.iconSize} />}
        right={(props) => <Text>{summary.total} of {favorites.length} Batteries</Text>}
        style={theme.components.Card.Title.style}
      />
      <Card.Content
        style={{ flexDirection: 'column' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >
          <Gauge value={Math.round(summary.soc)}
            maxvalue={100}
            // title="SOC"
            valuesuffix='%'
            variant={theme.components.Gauge.large}
            strokecolor={strokeColor}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }} >

          <ValueChip title="Voltage" value={Math.round(summary.voltage) / 1000} valueSuffix="V" />
          <ValueChip title="Current" value={Math.round(summary.current) / 1000} valueSuffix="A" />
          <ValueChip title="Watts" value={Math.round(summary.watts)} valueSuffix="W" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }} >

          <Chip icon={(props) => <Icon {...props} source={(lastSeenIconSource as any).source} size={theme.icons.iconSize} color={(lastSeenIconSource as any).color} />} style={theme.components.Chip.style} textStyle={theme.components.Chip.textStyle} compact={true}>{lastSeen}</Chip>
          {/* <BatteryStatusFlags status={summary.status} showNoFlags={false} /> */}
        </View>

      </Card.Content>
    </Card>

  );
}


function HelpOnBluetoothUnsupportedDevices() {

  if (isBluetoothAvailable()) {
    return null;
  }

  return (
    <List.Section title="Bluetooth Unavailable" id="help" description="Bluetooth is not supported on this device. Showing mock data instead." >
      <List.Item title="Using Mock Data" description="Using mock data for testing purposes only" icon="help-circle-outline" />
      <List.Item title="Battery" description="Devices named Battery can return battery data" icon="battery" />
      <List.Item title="Devices" description="Devices named Device are not batteries and will cause connection errors for testing" icon="devices" />
      <List.Item title="Connection Errors" description="Clicking on devices with (will cause connection errors) in their name will intentionally cause connection errors for testing" icon="alert-circle" />

    </List.Section>
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
