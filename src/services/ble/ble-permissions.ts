import { blelog as log } from '@/services/log/log-service';
import * as ExpoDevice from 'expo-device';
import { Platform } from 'react-native';


function isBluetoothAvailable(): boolean {
  return ExpoDevice.isDevice && Platform.OS !== 'web'
}

export async function requestPermission(): Promise<boolean> {

  log.info("BLEPermissions: Requesting permissions...running on platform: ", Platform.OS, ExpoDevice.isDevice ? "device" : "simulator/web");

  if (isBluetoothAvailable()) {
    log.error("BLEService: Running on unknown bluetooth platform. Should have used platform specific file.", Platform.OS);
  }

  return Promise.resolve(true);


}
