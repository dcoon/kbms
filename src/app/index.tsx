import { List } from '@/components/list/list-item';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Favorite, Settings } from '@/services/settings/settings-service';
import { router, useFocusEffect } from 'expo-router';
import { useAtom } from 'jotai';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { DeviceId } from 'react-native-ble-plx';
import { Card, Chip, Icon, List as PaperList, Text, useTheme } from 'react-native-paper';

import { colorForSoc } from '@/components/ble/battery';
import { AddDeviceAction, SettingsAction } from '@/components/ui/app-topbar';
import { FavoriteCard } from '@/components/ui/favorite-card';
import { Gauge } from '@/components/ui/gauge';
import { DEFAULT_ICON_SIZE, ValueChip } from '@/components/ui/ui-util';
import { BatteryStatus } from '@/services/ble/battery';
import { batteries, isBatteryConnected } from '@/services/ble/battery-service';
import { isBluetoothAvailable } from '@/services/ble/ble-types';
import log from '@/services/log/log-service';
import { PaperTheme } from '@/util/paper-theme';
import { formatDistanceToNow } from 'date-fns';
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
      router.push('/devices');
    }
  };
}


function FavoriteListEmptyComponent() {
  return (
    // <TouchableRipple onPress={() => router.push('/devices')}>
    //   <Card>
    //     <Card.Title title="No batteries yet" />
    //     <Card.Content>
    //       <PaperList.Item
    //         title="Add a battery"
    //         description="Tap here to browse devices and add your first battery"
    //         left={() => <PaperList.Icon icon="heart-outline" />}
    //         right={() => (
    //           <List.Icon icon="arrow-right" />
    //         )}
    //       />
    //     </Card.Content>
    //   </Card>
    // </TouchableRipple>

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
  const onDevicePress = useOnDevicePress();

  return (


    <PaperList.Accordion
      id="favorites"
      title="Batteries"
      description="Your favorite batteries for quick access"
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

  const [favorites] = useAtom<Favorite[]>(Settings.favorites);
  const [bats] = useAtom(batteries(favorites.map(fav => fav.id)));

  const theme = useTheme() as typeof PaperTheme;

  const summary = bats.reduce((acc, batteryData) => {
    if (batteryData) {
      acc.soc = (acc.soc * acc.total + batteryData.soc) / (acc.total + 1);
      acc.voltage = (acc.voltage * acc.total + batteryData.voltage) / (acc.total + 1);
      acc.current += batteryData.current;
      acc.watts += batteryData.voltage / 1000 * batteryData.current / 1000;
      acc.status = batteryData.status ?? acc.status;
      acc.lastUpdated = batteryData.lastUpdated && (!acc.lastUpdated || batteryData.lastUpdated < acc.lastUpdated) ? batteryData.lastUpdated : acc.lastUpdated;
      acc.total += 1;

    }
    return acc;
  }, { total: 0, soc: 0, voltage: 0, current: 0, watts: 0, status: new BatteryStatus(), lastUpdated: undefined as Date | undefined });

  const lastSeen = summary.lastUpdated ? formatDistanceToNow(summary.lastUpdated, { addSuffix: true }) : "Connecting...";

  const strokeColor = colorForSoc(summary.soc);
  const { width, height } = useWindowDimensions();
  const radius = width * 0.11;

  return (
    <Card style={theme.components.Card.style}>
      <Card.Title title="System Summary"
        // left={(props) => <SoCIcon soc={summary.soc} current={summary.current} size={props.size} />}
        left={(props) => <Icon source="home-battery-outline" size={DEFAULT_ICON_SIZE} />}
        right={(props) => <Text>{summary.total} of {favorites.length} Batteries</Text>}
        style={theme.components.Card.Title.style}
      />
      <Card.Content
        style={{ flexDirection: 'column' }}
      >
        <View style={theme.components.Card.Content.style as any}>
          <Gauge value={summary.soc}
            maxvalue={100}
            title="SOC"
            valuesuffix='%'
            strokecolor={strokeColor}
            radius={radius}
          />

          <ValueChip title="Voltage" value={Math.round(summary.voltage) / 1000} valueSuffix="V" />
          <ValueChip title="Current" value={Math.round(summary.current) / 1000} valueSuffix="A" />
          <ValueChip title="Watts" value={Math.round(summary.watts)} valueSuffix="W" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }} >

          <Chip icon="clock-outline" style={theme.components.Chip.style} textStyle={theme.components.Chip.textStyle} compact={true}>{lastSeen}</Chip>
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
