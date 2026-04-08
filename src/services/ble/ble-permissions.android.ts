import { blelog as log } from '@/services/log/log-service';
import * as ExpoDevice from 'expo-device';
import { PermissionsAndroid } from 'react-native';

export async function requestPermission(): Promise<boolean> {

    log.info("BLEService: Running on Android, requesting permissions...");


    if ((ExpoDevice.platformApiLevel ?? -1) >= 31) { // Android 12+
      log.info("BLEService: Android API level >= 31, requesting BLUETOOTH_SCAN, BLUETOOTH_CONNECT, and ACCESS_FINE_LOCATION permissions...");
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      log.debug("BLEService: Permissions result 2: ", granted);
      return granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
        (granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN);
    } else { // Android 11-
      log.info("BLEService: Android API level < 31, requesting ACCESS_FINE_LOCATION permission...");
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      log.debug("BLEService: Permissions result: ", granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };
