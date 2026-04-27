
import * as Battery from '@/services/ble/battery-service';
import { Bluetooth } from '@/services/ble/ble-service';
import { LoadableState } from '@/services/ble/ble-types';
import log from '@/services/log/log-service';
import { Favorite, Settings } from '@/services/settings/settings-service';
import { getIconForBleState } from '@/util/util';
import { router, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import React from 'react';
import { DeviceId, UUID } from 'react-native-ble-plx';
import { Appbar } from 'react-native-paper';
import { SnackbarMessage } from './snackbar';


const LOG_SRC = "AppTopBar";



export function BackAction({ visible }: { visible: boolean }) {

    return (
      <Appbar.BackAction onPress={() => router.back()} style={{visibility: visible ? 'visible' : 'hidden'}}/>
    );

}


export function AddDeviceAction() {

  const router = useRouter();

  return (
    <Appbar.Action icon="plus" onPress={() => router.push('/devices')} />
  );
}


export function SettingsAction() {

  const router = useRouter();

  return (
    <Appbar.Action icon="cog" onPress={() => router.push('/settings')} />
  );
}


interface LoadableActionProps<T> {
  loadable: any //Loadable<T>;
  getIconForData?: (data: T) => string;
  onPress: (data: T) => void
}

export function LoadableAction<T>({ loadable, getIconForData, onPress }: LoadableActionProps<T>) {

  const [, pushMessage] = useAtom(Settings.snackbar);

  switch (loadable.state) {
    case LoadableState.loading:
      return <Appbar.Action icon="loading" />;
    case LoadableState.hasError:
      return (
        <>
          <SnackbarMessage message={(loadable.error as Error).message} />
          <Appbar.Action icon="alert-circle-outline" onPress={() => { pushMessage((loadable.error as Error).message) }} />
        </>
      );
    case LoadableState.hasData:
      return <Appbar.Action icon={getIconForData ? getIconForData(loadable.data) : "unknown"} onPress={() => onPress(loadable.data)} />;
    default:
      return (
        <Appbar.Action icon="unknown" />
      );
  }
}

interface IsNotifyingActionProps {
  deviceId: DeviceId,
  serviceUUID: UUID,
  characteristicUUID: UUID,
}



export function IsNotifyingAction({ deviceId, serviceUUID, characteristicUUID }: IsNotifyingActionProps) {

  const [isNotifyingLoadable, setIsNotifying] = useAtom(Bluetooth.characteristicIsNotifying({ deviceId: deviceId, serviceUUID: serviceUUID, characteristicUUID: characteristicUUID }));

  return (
    <LoadableAction<boolean> loadable={isNotifyingLoadable as any} onPress={(data) => {
      setIsNotifying(!data)
    }} getIconForData={(data) => data ? "stop" : "refresh"

    } />
  );

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
  const icon = getIconForBleState(bleState);

  function onPress() {
    snackbar(`Bluetooth state: ${bleState}`);
  }

  return (
    <Appbar.Action icon={icon} onPress={onPress} />
  );
}



interface FavoriteActionProps {
  deviceId: DeviceId;
  name: string;
}

export function FavoriteAction({ deviceId, name }: FavoriteActionProps) {
  const favorite = { id: deviceId, name: name } as Favorite;
  const [isFavorite, setIsFavorite] = useAtom(Settings.favorite(favorite));

  return (
    <Appbar.Action icon={isFavorite ? "heart" : "heart-outline"} onPress={() => { setIsFavorite(favorite) }} />
  );

}




interface BatteryActionProps {
  deviceId: DeviceId;
}

export function BatteryAction({ deviceId }: BatteryActionProps) {
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

  const icon = isConnectedLoadable.state === LoadableState.hasData ? (isConnected ? "stop" : "play") : "refresh";

  log.debug(LOG_PREFIX, "called with deviceId: ", deviceId, " isConnected: ", isConnected, " loadable state: ", isConnectedLoadable.state);

  function onPress() {
    log.debug(LOG_PREFIX, "onPress called with deviceId: ", deviceId, " isConnected: ", isConnected);
    setIsConnected(!isConnected);
  }

  return (
    <Appbar.Action icon={icon} onPress={onPress} />
  );
}