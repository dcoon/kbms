import * as ExpoDevice from 'expo-device';
import { Platform } from 'react-native';
import { Base64, BleError, Characteristic, Device, DeviceId, State, UUID } from 'react-native-ble-plx';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
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


export function getIconForScanningState(isScanning: boolean): IconSource {
  return isScanning ? "stop" : "play";
}


export function getIconForConnectionState(isDeviceConnected: boolean): IconSource {

  return isDeviceConnected ? "stop" : "play";

  // switch (state) {
  //   case DeviceConnectionState.Connected:
  //     return "stop";
  //   case DeviceConnectionState.Connecting:
  //     return "sync";
  //   case DeviceConnectionState.Disconnected:
  //     return "play";
  //   default:
  //     return "unknown";
  // }
}

export function getIconForRssi(rssi?: number | null): { name: string, color?: string } {
  if (rssi === undefined || rssi === null) {
    return { name: "signal-off" }; //"signal-cellular-off"; // no signal
  } else if (rssi >= -80) {
    return { name: "signal-cellular-3", color: "green" }; // 4 bars
  } else if (rssi >= -90) {
    return { name: "signal-cellular-2", color: "green" }; // 3 bars                
  } else if (rssi >= -100) {
    return { name: "signal-cellular-1", color: "red" }; // 2 bars           
  } else {
    return { name: "signal-cellular-outline" }; // no signal    
  }
}

export function getIconForSoC(soc?: number): { name: string, color?: string } {

  if (soc === undefined || soc === null) {
    return { name: "battery-unknown" };
  } else if (soc >= 80) {
    return { name: "battery-high", color: "green" };
  } else if (soc >= 60) {
    return { name: "battery-medium", color: "orange" };
  } else if (soc >= 40) {
    return { name: "battery-low", color: "red" };
  } else if (soc >= 20) {
    return { name: "battery-outline", color: "red" };
  } else {
    return { name: "battery-0" }; 
  }
}


