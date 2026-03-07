import { BatteryData } from '@/constants/battery-types';
import { MOCK_BATTERY_DATA } from '@/constants/mock-data';
import { blelog as log } from '@/services/log';
import * as ExpoDevice from 'expo-device';
import { PermissionsAndroid, Platform } from 'react-native';
import { decode } from 'react-native-base64';
import { Device as BleDevice, BleError, BleManager, Characteristic, Descriptor, DeviceId, LogLevel, Service, UUID } from 'react-native-ble-plx';

// Standard Bluetooth GATT UUIDs
const BATTERY_SERVICE_UUID = '180f';
const BATTERY_LEVEL_CHAR_UUID = '2a19';


export type Device = Partial<BleDevice>;


export type BLEServiceInterface = {
  isScanning: boolean;
  scanForDevices: (onDeviceFound: (device: Device) => void, onError: (error: BleError) => void) => void;
  stopScanning: () => void;
  getDevices: () => Device[];
  // monitorCharacteristic: (deviceId: string, serviceUUID: string, characteristicUUID: string, onUpdate: (error: Error | null , characteristic: Characteristic | null) => void) => void;
  connectToBattery: (id: DeviceId,onBatteryUpdate: (data: BatteryData) => void) => void; 
}



 export function isBluetoothAvailable(): boolean {
    const available =  ExpoDevice.isDevice && Platform.OS !== 'web';
    return available;
  }

/**
 * BLE service implementation.
 * 
 * This class provides an interface to interact with the BLE module.
 * It allows to request permissions, scan for devices, connect to devices, disconnect from devices, and monitor device characteristics.
 * It uses the react-native-ble-plx library to manage BLE interactions and is designed to work on both Android and iOS platforms but will NOT work on web or simulators.
 * 
 * @return {BLEServiceInterface} An object that implements the BLEServiceInterface.
 * @see BLEServiceInterface
 */
export function BLEService(): BLEServiceInterface {

  let bleManager: BleManager;
try {
    bleManager = new BleManager();
    bleManager.setLogLevel(LogLevel.Verbose);
    bleManager.onStateChange((state) => {
      log.info("BLEService: BLE state changed to", state);
    }, true);
  
} catch (error) {
    log.error("Failed to initialize BLE Manager: ", error);  
}
  
  
  let isScanning = false;

  function getDevices(): Device[] {
    // This is a placeholder implementation. In a real implementation, you would maintain a list of discovered devices in the service and return that list here.
    log.warn("BLEService: getDevices is not implemented yet. Returning empty array.");
    return [];
  }

  log.info("BLEService: testing testing foobar");



async function requestPermissionsAndroid(): Promise<boolean> {

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

  async function requestPermissionsIOS(): Promise<boolean> {
    log.warn("BLEService: Running on iOS, requesting permissions...NOT IMPLEMENTED");
    return false;
  }

  async function requestPermissions(): Promise<boolean> {

    log.info("BLEService: Requesting permissions...");

    if (!ExpoDevice.isDevice) {
      log.warn("BLEService: Running on web, requesting permissions...NOT IMPLEMENTED");
      return false;
    } else if (Platform.OS === 'android') {
      return requestPermissionsAndroid();
      // if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
      //   log.info("BLEService: Android API level < 31, requesting ACCESS_FINE_LOCATION permission...");
      //   const granted = await PermissionsAndroid.request(
      //     PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      //   );

      //   return granted === PermissionsAndroid.RESULTS.GRANTED;
      // } else {
      //   log.info("BLEService: Android API level >= 31, requesting BLUETOOTH_SCAN, BLUETOOTH_CONNECT, and ACCESS_FINE_LOCATION permissions...");
      //   const bluetoothScanPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
      //   const bluetoothConnectPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
      //   const fineLocationPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      //   return bluetoothScanPermission === 'granted' && bluetoothConnectPermission === 'granted' && fineLocationPermission === 'granted';
      // }
    } else if (Platform.OS === 'ios') {
      return requestPermissionsIOS();
    } else {
      log.warn("BLEService: Running on unknown platform", Platform.OS);
      return false;
    }   
    
  }

  async function scanForDevices(onDeviceFound: (device: Device) => void, onError: (error: BleError) => void) {

   

    const permission = await requestPermissions();
      if (!permission) {
        log.error("Bluetooth permissions denied");
        return;
      } else {
        log.info("Bluetooth permissions granted, starting scan...");
        // startScanning(onDeviceFound, onError);
      }
    
    log.info("BLEService: Starting device scan...");
    isScanning = true;
    
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        onError(error);
        return;
      }
      if (device && (device.name || device.localName)) {
        // this.discoveredDevices.set(device.id, device);
        onDeviceFound(device);
      }
    });
  }

  function stopScanning() {
    isScanning = false;
    bleManager.stopDeviceScan();
  }

  async function connectToDevice(deviceId: string): Promise<Device> {
      stopScanning();
      return bleManager.connectToDevice(deviceId, { autoConnect: true });
  }

  async function disconnectFromDevice(deviceId: string) {
    return bleManager.cancelDeviceConnection(deviceId);
  }

  async function getServicesForDevice(deviceId: string): Promise<Service[]> {
    try {
      const services = await bleManager.servicesForDevice(deviceId);
      return services;
    } catch (e) {
      log.error('Failed to get services:', e);
      throw e;
    }
  }

  function decodeBLEData(value: string | null) {
    if (!value) return null;
    const decodedValue = decode(value);
    const buffer = new Uint8Array(decodedValue.length);
    for (let i = 0; i < decodedValue.length; i++) {
      buffer[i] = decodedValue.charCodeAt(i);
    }
    return buffer;
  }

  async function characteristicsForDevice(deviceId: string, serviceUUID: string) {
    try {
      const characteristics = await bleManager.characteristicsForDevice(deviceId, serviceUUID);
      return characteristics;
    } catch (e) {
      log.error('Failed to get characteristics:', e);
      throw e;
    }
  }

async function descriptorsForCharacteristic(deviceId: DeviceId, serviceUUID: UUID, characteristicUUID: UUID): Promise<Descriptor[]> {
  try {
    const descriptors = await bleManager.descriptorsForDevice(deviceId, serviceUUID, characteristicUUID);
    return descriptors;
  } catch (e) {
    log.error('Failed to get descriptors:', e);
    throw e;
    }
  }


  function devicesToString(devices: Device[]): string {
    return devices.map(d => `${d.name || 'Unknown'} (${d.id})`).join(', ');
  }


  async function getDevice(id: DeviceId): Promise<Device | undefined> {
    log.debug("Getting device with ID: ", id);
    const devices = await bleManager.devices([id]);
    
    return devices.find(d => d && d.id === id);

  } 

  async function getConnectedDevice(id: DeviceId): Promise<Device | undefined> {
    log.debug("Getting connected device with ID: ", id);

    const device = await getDevice(id);

    return device?.isConnected ? device : device?.connect?.();
  }

  async function getConnectedAndDiscoveredDevice(id: DeviceId): Promise<Device | undefined> {
    log.debug("Getting connected and discovered device with ID: ", id);

    const isDeviceConnected = await bleManager.isDeviceConnected(id);
    log.debug("Is device connected? ", isDeviceConnected);
    if(!isDeviceConnected) {    
      log.debug("Connecting to device with ID: ", id);
      await bleManager.connectToDevice(id, { autoConnect: true });
    }

    log.debug("Calling discoverAllServicesAndCharacteristicsForDevice with ID: ", id);
    return bleManager.discoverAllServicesAndCharacteristicsForDevice(id);
      
  } 

  function monitorCharacteristic(deviceId: string, serviceUUID: string, characteristicUUID: string, onUpdate: (error: Error | null , characteristic: Characteristic | null) => void) {
    log.info("Monitoring characteristic for device: ", deviceId, "serviceUUID: ", serviceUUID, "characteristicUUID: ", characteristicUUID);

    const device = getConnectedAndDiscoveredDevice(deviceId).then((device) => {
      log.debug("Device found for monitoring: ", device?.id, "isConnected: ", device?.isConnected?.());
      if (device) {
        bleManager.monitorCharacteristicForDevice(deviceId, serviceUUID, characteristicUUID, onUpdate);
      }
    });

  }


  function connectToBattery(id: DeviceId, onBatteryUpdate: (data: BatteryData) => void): void {  
    log.info("BLEService: connectToBattery called");   
    bleManager.stopDeviceScan();

    monitorCharacteristic(id, BATTERY_SERVICE_UUID, BATTERY_LEVEL_CHAR_UUID, (error, characteristic) => {
      if (error) {
        log.error("Error monitoring battery characteristic: ", error);
        return;
      } else if (characteristic) {
        log.info("Received battery characteristic update: ", characteristic.value);
        const data = MOCK_BATTERY_DATA; // Replace with actual parsing of characteristic.value
        onBatteryUpdate(data);
      }
    });
  }

  return {
    isScanning,
    scanForDevices,
    stopScanning,
    getDevices,
    connectToBattery
  };
}

