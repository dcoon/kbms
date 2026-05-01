
import * as Battery from '@/services/battery/battery-service';
import { CharacteristicIdentifier, DeviceOrFavorite } from '@/services/ble/ble';
import { Bluetooth } from '@/services/ble/ble-service';
import { BluetoothStateIconSource } from '@/services/ble/icons';
import log from '@/services/log/log-service';
import { KV_BATTERY_NOTIFY_UUID, KV_BATTERY_SERVICE_UUID } from '@/services/manufacturers/kilovault/battery-data-types';
import { Favorite, Settings } from '@/services/settings/settings-service';
import { ThemeType } from '@/theme/theme';
import { LoadableState } from '@/util/util';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import React from 'react';
import { Device, DeviceId } from 'react-native-ble-plx';
import { Appbar, useTheme } from 'react-native-paper';
import { SnackbarMessage } from './snackbar';


const LOG_SRC = "AppTopBar";


// TODO: refactory appbar.actions to not need to pass theme
export function getAppBarTheme(theme: ThemeType) {
    return { ...theme, colors: { ...theme.colors, ...theme.components.appBar.theme.colors } };
}

export function AddDeviceAction() {

  const router = useRouter();
const theme = useTheme() as ThemeType;
const appBarTheme = getAppBarTheme(theme);

  return (
    <Appbar.Action icon="plus" color={appBarTheme.colors.onSurface} rippleColor={appBarTheme.colors.onSurfaceVariant} onPress={() => router.push('/devices')} theme={appBarTheme} />
  );
}


export function SettingsAction() {

  const router = useRouter();
  const theme = useTheme() as ThemeType;
  const appBarTheme = getAppBarTheme(theme);

  return (
    <Appbar.Action icon="cog" color={appBarTheme.colors.onSurface} onPress={() => router.push('/settings')} theme={appBarTheme} />
  );
}


interface LoadableActionProps<T> {
  loadable: any //Loadable<T>;
  getIconForData?: (data: T) => string;
  onPress: (data: T) => void
}

export function LoadableAction<T>({ loadable, getIconForData, onPress }: LoadableActionProps<T>) {

  const [, pushMessage] = useAtom(Settings.snackbar);
  const theme = useTheme() as ThemeType;
  const appBarTheme = getAppBarTheme(theme);

  switch (loadable.state) {
    case LoadableState.loading:
      return <Appbar.Action icon="loading" color={appBarTheme.colors.onSurface} theme={appBarTheme} />;
    case LoadableState.hasError:
      return (
        <>
          <SnackbarMessage message={(loadable.error as Error).message} />
          <Appbar.Action icon="alert-circle-outline" color={appBarTheme.colors.onSurface} onPress={() => { pushMessage((loadable.error as Error).message) }} theme={appBarTheme} />
        </>
      );
    case LoadableState.hasData:
      return <Appbar.Action icon={getIconForData ? getIconForData(loadable.data) : "unknown"} color={appBarTheme.colors.onSurface} onPress={() => onPress(loadable.data)} theme={appBarTheme} />;
    default:
      return (
        <Appbar.Action icon="unknown" color={appBarTheme.colors.onSurface} theme={appBarTheme} />
      );
  }
}


function IsNotifyingActionNotUndefined({ deviceId, serviceUUID, characteristicUUID }: CharacteristicIdentifier) {

  const [isNotifyingLoadable, setIsNotifying] = useAtom(Bluetooth.characteristicIsNotifying({ deviceId: deviceId, serviceUUID: serviceUUID, characteristicUUID: characteristicUUID }));
  const theme = useTheme() as ThemeType;
  
  return (
    <LoadableAction<boolean> loadable={isNotifyingLoadable as any} onPress={(data) => {
      setIsNotifying(!data)
    }} getIconForData={(data) => data ? theme.icons.connectionState.connected.source : theme.icons.connectionState.disconnected.source

    } />
  );

}

export function IsBatteryConnectedAction({ device }: { device?: Device }) {
  const theme = useTheme() as ThemeType;
  const appBarTheme = getAppBarTheme(theme);

  if (!device) {
    return <Appbar.Action icon={theme.icons.connectionState.unknown.source} theme={appBarTheme} />;
  } else {
    return <IsNotifyingActionNotUndefined deviceId={device.id} serviceUUID={KV_BATTERY_SERVICE_UUID} characteristicUUID={KV_BATTERY_NOTIFY_UUID} />
  }
}


export function IsScanningAction() {

  const [isScanningLoadable, setIsScanning] = useAtom(Bluetooth.scanning);


  return (
    <LoadableAction<boolean> loadable={isScanningLoadable as any} onPress={(data) => { setIsScanning(!data) }} getIconForData={(data) => data ? "stop" : "play"} />
  );
}

interface DeviceActionProps {
  deviceId: DeviceId;
}

export function DeviceAction({ deviceId }: DeviceActionProps) {

  const router = useRouter();

  const [developerMode] = useAtom(Settings.developerMode);

  function onPressDevice() {


    router.push(
      {
        pathname: "/devices/[deviceid]",
        params: {
          deviceid: deviceId
        }
      }
    );
  }

  if (!developerMode) {
    return null;
  }

  return (
    <Appbar.Action icon="devices" onPress={onPressDevice} />
  );

}

export function BleStateAction() {


  const [bleState] = useAtom(Bluetooth.bleState);
  const [, snackbar] = useAtom(Settings.snackbar);
  const icon = BluetoothStateIconSource(bleState);
  const theme = useTheme() as ThemeType;
  const appBarTheme = getAppBarTheme(theme);

  function onPress() {
    snackbar(`Bluetooth state: ${bleState}`);
  }

  return (
    <Appbar.Action icon={icon} color={appBarTheme.colors.onSurface} onPress={onPress} theme={appBarTheme} />
  );
}



function FavoriteActionNotUndefined({ device }: { device: DeviceOrFavorite }) {
  const favorite = { id: device.id, name: device.name } as Favorite;
  const [isFavorite, setIsFavorite] = useAtom(Settings.favorite(favorite));
  const theme = useTheme() as ThemeType;
  const appBarTheme = getAppBarTheme(theme);

  return (
    <Appbar.Action icon={isFavorite ? theme.icons.favorite.true.source : theme.icons.favorite.false.source} color={appBarTheme.colors.onSurface} onPress={() => { setIsFavorite(favorite) }} theme={appBarTheme} />
  );

}

export function FavoriteAction({ device }: { device: DeviceOrFavorite | undefined }) {

  const theme = useTheme() as ThemeType;
  const appBarTheme = getAppBarTheme(theme);

  if (!device) {
    return <Appbar.Action icon={theme.icons.favorite.unknown.source} theme={appBarTheme} />;
  } else {
    return <FavoriteActionNotUndefined device={device} />
  }
}





interface BatteryActionProps {
  deviceId: DeviceId;
}

function BatteryAction({ deviceId }: BatteryActionProps) {
  const [developerMode] = useAtom(Settings.developerMode);



  if (!developerMode) {
    return null;
  }

  return (
    <BatteryActionDeveloperMode deviceId={deviceId} />
  )

};


function BatteryActionDeveloperMode({ deviceId }: BatteryActionProps) {
  const [isKnownBatteryTypeLoadable] = useAtom(Battery.isKnownBatteryType(deviceId));
  const isKnownBatteryType = isKnownBatteryTypeLoadable.state === LoadableState.hasData ? isKnownBatteryTypeLoadable.data : false;
  const router = useRouter();



  function onBatteryPress() {
    router.push(
      {
        pathname: "/devices/[deviceid]",
        params: {
          deviceid: deviceId
        }
      }
    );
  }

  if (!isKnownBatteryType) {
    return null;
  }

  return (
    <Appbar.Action icon="battery" onPress={onBatteryPress} />
  )

}


interface IsDeviceConnectedActionProps {
  deviceId: DeviceId;
}

export function IsDeviceConnectedAction({ deviceId }: IsDeviceConnectedActionProps) {

  const LOG_PREFIX = LOG_SRC + ": IsDeviceConnectedAction";


  const [isConnectedLoadable, setIsConnected] = useAtom(Bluetooth.isDeviceConnected(deviceId));
  const isConnected = isConnectedLoadable.state === LoadableState.hasData ? isConnectedLoadable.data : false;
  const theme = useTheme() as ThemeType;
  const appBarTheme = getAppBarTheme(theme);

  const icon = isConnectedLoadable.state === LoadableState.hasData ? (isConnected ? "stop" : "play") : "refresh";

  log.debug(LOG_PREFIX, "called with deviceId: ", deviceId, " isConnected: ", isConnected, " loadable state: ", isConnectedLoadable.state);

  function onPress() {
    log.debug(LOG_PREFIX, "onPress called with deviceId: ", deviceId, " isConnected: ", isConnected);
    setIsConnected(!isConnected);
  }

  return (
    <Appbar.Action icon={icon} onPress={onPress} theme={appBarTheme} />
  );
}