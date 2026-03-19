import { blelog as log } from '@/services/log';
import * as ExpoDevice from 'expo-device';
import { PermissionsAndroid, Platform } from 'react-native';
import base64 from 'react-native-base64';
import { Device as BleDevice, DeviceId as BleDeviceId, BleError, BleManager, Characteristic, LogLevel } from 'react-native-ble-plx';

// Standard Bluetooth GATT UUIDs
const BATTERY_SERVICE_UUID = '180f';
const BATTERY_LEVEL_CHAR_UUID = '2a19';

const UUID_SERVICE = "0000ffe0-0000-1000-8000-00805f9b34fb";
const UUID_NOTIFY = "0000ffe4-0000-1000-8000-00805f9b34fb";
const UUID_RENAME = "0000ffe6-0000-1000-8000-00805f9b34fb";
const UUID_WRITE = "0000ffe1-0000-1000-8000-00805f9b34fb";

export type DeviceId = BleDeviceId;

export type Device = {
  id: DeviceId;
  name: string | null;
  localName: string | null;
  rssi: number | null;
  lastSeen: number;
  isConnected: boolean;
  isFavorite?: boolean;
  batteryInfo?: BatteryInfo;
}

export type BatteryInfo = {
  voltage: number;
  current: number;
  capacity: number;
  temperature: number;
  cycles: number;
  soc: number;
  status: 'Healthy' | 'Warning' | 'Critical';
};

export class BlankDevice implements Device {
  id: DeviceId = "unknown";
  name: string | null = "Unknown Device";
  localName: string | null = null;
  rssi: number | null = null;
  lastSeen: number = Date.now();
  isConnected: boolean = false;
  batteryInfo?: BatteryInfo = undefined;

  constructor(id: DeviceId) {
    this.id = id;
  } 
}

class BleDeviceWrapper implements Device {
  _device: BleDevice;
  
  constructor(bleDevice: BleDevice) { 
    this._device = bleDevice;
  }

  get id(): DeviceId {
    return this._device.id;
  }

  get name(): string | null {
    return this._device.name || this._device.localName || null;
  }

  get rssi(): number | null {
    return this._device.rssi;
  }

  get lastSeen(): number {
    return Date.now();
  }

  get batteryInfo(): BatteryInfo | undefined {
    // This is a placeholder implementation. In a real implementation, you would read the battery characteristic from the device and parse it into a BatteryInfo object.
    return undefined;
  }

  get isConnected(): boolean {
    return false; // this._device.isConnected();
  }

  get localName(): string | null {
    return this._device.localName || null;
  }
}

export type BLEServiceInterface = {
  isScanning: boolean;
  scanForDevices: (onDeviceFound: (device: Device) => void, onError: (error: BleError) => void) => void;
  stopScanning: () => void;
  getDevices: () => Device[];
  // monitorCharacteristic: (deviceId: string, serviceUUID: string, characteristicUUID: string, onUpdate: (error: Error | null , characteristic: Characteristic | null) => void) => void;
  connectToBattery: (id: DeviceId, onBatteryUpdate: (device: Device) => void) => void;
}



export function isBluetoothAvailable(): boolean {
  const available = ExpoDevice.isDevice && Platform.OS !== 'web';
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
        onDeviceFound(new BleDeviceWrapper(device));
      }
    });
  }

  function stopScanning() {
    isScanning = false;
    bleManager.stopDeviceScan();
  }

  // async function connectToDevice(deviceId: string): Promise<Device> {
  //   stopScanning();
  //   return bleManager.connectToDevice(deviceId, { autoConnect: true });
  // }

  // async function disconnectFromDevice(deviceId: string) {
  //   return bleManager.cancelDeviceConnection(deviceId);
  // }

  // async function getServicesForDevice(deviceId: string): Promise<Service[]> {
  //   try {
  //     const services = await bleManager.servicesForDevice(deviceId);
  //     return services;
  //   } catch (e) {
  //     log.error('Failed to get services:', e);
  //     throw e;
  //   }
  // }

  // function decodeBLEData(value: string | null) {
  //   if (!value) return null;
  //   const decodedValue = decode(value);
  //   const buffer = new Uint8Array(decodedValue.length);
  //   for (let i = 0; i < decodedValue.length; i++) {
  //     buffer[i] = decodedValue.charCodeAt(i);
  //   }
  //   return buffer;
  // }

  // async function characteristicsForDevice(deviceId: string, serviceUUID: string) {
  //   try {
  //     const characteristics = await bleManager.characteristicsForDevice(deviceId, serviceUUID);
  //     return characteristics;
  //   } catch (e) {
  //     log.error('Failed to get characteristics:', e);
  //     throw e;
  //   }
  // }

  // async function descriptorsForCharacteristic(deviceId: DeviceId, serviceUUID: UUID, characteristicUUID: UUID): Promise<Descriptor[]> {
  //   try {
  //     const descriptors = await bleManager.descriptorsForDevice(deviceId, serviceUUID, characteristicUUID);
  //     return descriptors;
  //   } catch (e) {
  //     log.error('Failed to get descriptors:', e);
  //     throw e;
  //   }
  // }


  // function devicesToString(devices: Device[]): string {
  //   return devices.map(d => `${d.name || 'Unknown'} (${d.id})`).join(', ');
  // }


  // async function getDevice(id: DeviceId): Promise<Device | undefined> {
  //   log.debug("Getting device with ID: ", id);
  //   const devices = await bleManager.devices([id]);

  //   return devices.find(d => d && d.id === id);

  // }

  // async function getConnectedDevice(id: DeviceId): Promise<Device | undefined> {
  //   log.debug("Getting connected device with ID: ", id);

  //   const device = await getDevice(id);

  //   return device?.isConnected ? device : device?.connect?.();
  // }

  async function getConnectedAndDiscoveredDevice(id: DeviceId): Promise<BleDevice> {
    log.debug("Getting connected and discovered device with ID: ", id);

    const isDeviceConnected = await bleManager.isDeviceConnected(id);
    // log.debug("Is device connected? ", isDeviceConnected);
    if (!isDeviceConnected) {
      log.debug("Connecting to device with ID: ", id);
      await bleManager.connectToDevice(id, { autoConnect: true });
    }

    // log.debug("Calling discoverAllServicesAndCharacteristicsForDevice with ID: ", id);
    return bleManager.discoverAllServicesAndCharacteristicsForDevice(id);

  }

  async function dumpServicesForDevice(deviceId: string) {
    const device = await getConnectedAndDiscoveredDevice(deviceId);
    const info = {};

    const services = await bleManager.servicesForDevice(deviceId);

    for (const service of services) {
      const service2 = { ...service, characteristics: [] as any[] };

      Object.assign(info, { [service.uuid as keyof typeof info]: service2 });
      const characteristics = await bleManager.characteristicsForDevice(deviceId, service.uuid);
      for (const characteristic of characteristics) {
        const characteristic2 = { ...characteristic, descriptors: [] as any[] };
        service2.characteristics.push(characteristic2);
        // Object.assign(service2, { [characteristic.uuid as keyof typeof service2]: characteristic2 });
        if (characteristic.isReadable) {
          const value = await bleManager.readCharacteristicForDevice(deviceId, service.uuid, characteristic.uuid);
          characteristic2.value = value.value + " (" + base64.decode(value.value ? value.value : "") + ")";

        }
        const descriptors = await bleManager.descriptorsForDevice(deviceId, service.uuid, characteristic.uuid);
        for (const descriptor of descriptors) {
          const descriptor2 = { ...descriptor };
          characteristic2.descriptors.push(descriptor2);
          // Object.assign(characteristic2, { [descriptor.uuid as keyof typeof characteristic2]: descriptor2 });
        }

      }
    }

    log.debug("Device services and characteristics: ", JSON.stringify(info, null, 2));

  }

  function monitorCharacteristic(deviceId: string, serviceUUID: string, characteristicUUID: string, onUpdate: (error: Error | null, characteristic: Characteristic | null) => void) {
    log.info("Monitoring characteristic for device: ", deviceId, "serviceUUID: ", serviceUUID, "characteristicUUID: ", characteristicUUID);

    const device = getConnectedAndDiscoveredDevice(deviceId).then((device) => {
      // log.debug("Device found for monitoring: ", device?.id, "isConnected: ", device?.isConnected?.());
      if (device && device.id) {
        dumpServicesForDevice(device.id);
        bleManager.monitorCharacteristicForDevice(deviceId, serviceUUID, characteristicUUID, onUpdate);
      }
    });

  }

  function stringToBytes(str: string): Uint8Array {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  }

  async function dumpCharacteristicNotifications(deviceId: string, serviceUUID: string, characteristicUUID: string) {

    const device = await getConnectedAndDiscoveredDevice(deviceId);
    log.info("dumpCharacteristicNotifications for device: ", device);

    if (device && device.id) {
      bleManager.monitorCharacteristicForDevice(deviceId, serviceUUID, characteristicUUID, (error, characteristic) => {
        if (error) {
          log.error("Error monitoring characteristic: ", error);
          return;
        } else if (characteristic) {
          // log.info("Received characteristic update: ", characteristic.value);
          // bleManager.readCharacteristicForDevice(deviceId, serviceUUID, characteristicUUID).then((char) => {
          // onUpdate(characteristic);
          if (characteristic.value) {
            const value = base64.decode(characteristic.value);
            // const arr = stringToBytes(value);
            console.log(characteristic.value);
          }
          // console.log(characteristic.value + " (" + base64.decode(characteristic.value ? characteristic.value : "AAAA")  + ")");
          // });
        }
      });
    }
  }
  function connectToBattery(id: DeviceId, onBatteryUpdate: (device: Device) => void): void {
    log.info("BLEService: connectToBattery called");
    bleManager.stopDeviceScan();

    // dumpServicesForDevice(id);
    dumpCharacteristicNotifications(id, UUID_SERVICE, UUID_NOTIFY);
  }

  // function connectToBattery2(id: DeviceId, onBatteryUpdate: (data: BatteryData) => void): void {
  //   log.info("BLEService: connectToBattery called");
  //   bleManager.stopDeviceScan();

  //   // monitorCharacteristic(id, UUID_SERVICE, UUID_NOTIFY, (error, characteristic) => {
  //   //   if (error) {
  //   //     log.error("Error monitoring battery characteristic: ", error);
  //   //     return;
  //   //   } else if (characteristic) {
  //   //     log.info("Received battery characteristic update: ", characteristic.value);
  //   //     bleManager.readCharacteristicForDevice(id, UUID_SERVICE, UUID_NOTIFY).then((char) => {
  //   //       log.info("Read battery characteristic: ", char.value);
  //   //     });
  //   //     const data = MOCK_BATTERY_DATA; // Replace with actual parsing of characteristic.value
  //   //     onBatteryUpdate(data);
  //   //   }
  //   // });

  //   const device = getConnectedAndDiscoveredDevice(id).then((device) => {

  //     if (device && device.isConnected) {
  //       log.info("Device is connected, starting to monitor battery characteristic...");
  //       if (device && device.id) {
  //         bleManager.monitorCharacteristicForDevice(device.id, UUID_SERVICE, UUID_NOTIFY, (error, characteristic) => {
  //           if (error) {
  //             log.error("Error monitoring battery characteristic: ", error);
  //             return;
  //           } else if (characteristic) {
  //             log.info("Received battery characteristic update: ", characteristic.value);
  //             bleManager.readCharacteristicForDevice(id, UUID_SERVICE, UUID_NOTIFY).then((char) => {
  //               log.info("Read battery characteristic: ", char.value);

  //             });
  //           }
  //         });

  //       } else {
  //         log.info("Device is not connected, attempting to connect...");
  //       }

  //     }
  //   });
  // }

  return {
    isScanning,
    scanForDevices,
    stopScanning,
    getDevices,
    connectToBattery
  };
}

