import * as ExpoDevice from 'expo-device';
import { Platform } from 'react-native';
import { Base64, BleError, Characteristic, Device, DeviceId, State, UUID } from 'react-native-ble-plx';
import { Favorite } from '../settings/settings-service';

// general types

export type DeviceIdentifier ={ 
  deviceId: DeviceId;
};

export type ServiceIdentifier = {
  deviceId: DeviceId;
  serviceUUID: UUID;
};
export type CharacteristicIdentifier = {
  deviceId: DeviceId;
  serviceUUID: UUID;
  characteristicUUID: UUID;
};
// loadable helpers

export const LoadableState = {
  hasData: 'hasData',
  hasError: 'hasError',
  loading: 'loading'
} as const;

export type Loadable<T> =
  | { state: 'loading' }
  | { state: 'hasData'; data: Awaited<T> }
  | { state: 'hasError'; error: unknown };

export { BleError, Device, DeviceId, LogLevel, State, UUID } from 'react-native-ble-plx';

export type ServiceId = UUID;
export type CharacteristicId = UUID;
export type DescriptorId = UUID;

export type DataValue = Base64;

export type CharacteristicValueType = Base64 | null;

export type ServiceDataMap = { [uuid: string]: DataValue; };

export type DeviceUpdateListener = (error: BleError | null, device: Device | null) => void;

export type DeviceConnectionStateListener = DeviceUpdateListener;

export type BluetoothStateListener = (state: State) => void;

export type CharacteristicUpdateListener = (error: BleError | null, characteristic: Characteristic | null) => void;


export function isBluetoothAvailable(): boolean {
  return ExpoDevice.isDevice && Platform.OS !== 'web';
}

export const getDeviceName = (device: Device | Favorite | undefined): string => {
  if (!device) {
    return "Unknown Device";
  } else if (device.name) {
    return device.name;
  // } else if (device.localName) {
  //   return device.localName;
  } else if (device.id) {
    return device.id;
  }

  return "Unknown Device";
}



