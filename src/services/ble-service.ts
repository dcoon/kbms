import { EventBus, EventDefault, EventType } from '@/components/event-bus-provider';
import { blelog as log } from '@/services/log';
import { BatteryData, transformCharValueStreamToBatteryDataPipeline } from '@/services/SmartPowerMessageUtil';
import * as ExpoDevice from 'expo-device';
import { PermissionsAndroid, Platform } from 'react-native';
import { Device as BleDevice, DeviceId as BleDeviceId, BleError, BleManager, State as BleState, Characteristic, LogLevel } from 'react-native-ble-plx';

import { map, of } from "rxjs";

// Standard Bluetooth GATT UUIDs
// const BATTERY_SERVICE_UUID = '180f';
// const BATTERY_LEVEL_CHAR_UUID = '2a19';

const UUID_SERVICE = "0000ffe0-0000-1000-8000-00805f9b34fb";
const UUID_NOTIFY = "0000ffe4-0000-1000-8000-00805f9b34fb";
const UUID_RENAME = "0000ffe6-0000-1000-8000-00805f9b34fb";
const UUID_WRITE = "0000ffe1-0000-1000-8000-00805f9b34fb";

export type DeviceId = BleDeviceId;
export { BatteryData };


type DeviceInitializer = BleDevice | { id: DeviceId; name: string };

export class Device {
  id: DeviceId = "";
  name: string | null = null;
  rssi: number | null = null;
  isConnected: boolean = false;

  constructor(init: DeviceInitializer) {
    if ('id' in init && 'name' in init) {
      this.id = init.id;
      this.name = init.name;    }
  }

  static isDevice(obj: any): obj is Device {
    return obj && typeof obj === 'object' && 'id' in obj && typeof obj.id === 'string';
  }

  static isDeviceArray(obj: any): obj is Device[] {
    return Array.isArray(obj) && obj.every(item => Device.isDevice(item));
  }
}

// type onDeviceFoundCallback = (device: Device) => void;
// type onBatteryUpdateCallback = (data: BatteryData) => void;

export type NotificationTypes = Device | BatteryData | BleState | null;

export interface BLEServiceInterface {
  isScanning: () => boolean;
  scanForDevices: () => void;
  stopScanning: () => void;
  connectToBattery: (id: DeviceId) => void;
  disconnectFromBattery: (id: DeviceId) => void;
  setEventBus: (bus: EventBus) => void;
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

  const bleManager = getBLEManager();

  // const eventBus = new Subject<NotificationTypes>();


  let eventBus: EventBus | null = null;

  // const characteristicUpdateSubject = new Subject<string>();
  // characteristicUpdateSubject.pipe(transformCharValueStreamToBatteryDataPipeline);

  // const deviceUpdateSubject = new Subject<Device>();

  let _isScanning = false;
  let hasPermissions = false;

  function setEventBus(bus: EventBus) {
    eventBus = bus;
  }

  function getBLEManager(): BleManager {
    if (bleManager) {
      log.info("BLEService: BLEManager already created, returning existing instance.");
      return bleManager;
    } else {
      log.info("BLEService: Creating new BLEManager instance.");
      const manager = new BleManager();
      manager.setLogLevel(LogLevel.Verbose);
      manager.onStateChange((state) => {
        log.info("BLEManager state changed: ", state);
        eventBus?.next(new EventDefault(EventType.BleStateChanged, state));
      }, true);
      return manager;

    }

  }

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

    if (hasPermissions) {
      log.debug("BLEService: Permissions already granted, skipping request.");
    }
    else if (!ExpoDevice.isDevice) {
      log.debug("BLEService: Running on web, requesting permissions...NOT IMPLEMENTED");
      hasPermissions = true; // Assume permissions are granted on web for testing purposes
    } else if (Platform.OS === 'android') {
      hasPermissions = await requestPermissionsAndroid();
    } else if (Platform.OS === 'ios') {
      hasPermissions = await requestPermissionsIOS();
    } else {
      log.warn("BLEService: Running on unknown platform", Platform.OS);
      hasPermissions = false;
    }

    return hasPermissions;
  }

  async function onDeviceFound(error: BleError | null, bleDevice: BleDevice | null) {
    if (error) {
      log.error("onDeviceFound: Error found: ", error);
    } else if (bleDevice) {
      log.info("onDeviceFound: Device found: ", bleDevice);
      const device = new Device(bleDevice);
      device.isConnected = await bleDevice.isConnected();
      device.rssi = bleDevice.rssi;
      eventBus?.next(new EventDefault(EventType.DeviceScanned, device));
    }
  }
  async function scanForDevices() {
    const permission = await requestPermissions();
    if (!permission) {
      log.error("Bluetooth permissions denied");

    } else {
      log.info("BLEService: Starting device scan...");
      _isScanning = true;
      bleManager.startDeviceScan(null, null, onDeviceFound);
      //const device = await bleManager.devices([]); 
    }
  }

  function stopScanning() {
    _isScanning = false;
    bleManager.stopDeviceScan();
  }


  async function getConnectedAndDiscoveredDevice(id: DeviceId): Promise<BleDevice> {
    log.debug("Getting connected and discovered device with ID: ", id);

    const isDeviceConnected = await bleManager.isDeviceConnected(id);
    // log.debug("Is device connected? ", isDeviceConnected);
    if (!isDeviceConnected) {
      log.debug("Connecting to device with ID: ", id);
      await bleManager.connectToDevice(id, { autoConnect: true });
    }

    // log.debug("Calling discoverAllServicesAndCharacteristicsForDevice with ID: ", id);
    const device = await bleManager.discoverAllServicesAndCharacteristicsForDevice(id);
    onDeviceFound(null, device);
    return device;

  }

  // async function dumpServicesForDevice(deviceId: string) {
  //   const device = await getConnectedAndDiscoveredDevice(deviceId);
  //   const info = {};

  //   const services = await bleManager.servicesForDevice(deviceId);

  //   for (const service of services) {
  //     const service2 = { ...service, characteristics: [] as any[] };

  //     Object.assign(info, { [service.uuid as keyof typeof info]: service2 });
  //     const characteristics = await bleManager.characteristicsForDevice(deviceId, service.uuid);
  //     for (const characteristic of characteristics) {
  //       const characteristic2 = { ...characteristic, descriptors: [] as any[] };
  //       service2.characteristics.push(characteristic2);
  //       // Object.assign(service2, { [characteristic.uuid as keyof typeof service2]: characteristic2 });
  //       if (characteristic.isReadable) {
  //         const value = await bleManager.readCharacteristicForDevice(deviceId, service.uuid, characteristic.uuid);
  //         characteristic2.value = value.value + " (" + base64.decode(value.value ? value.value : "") + ")";

  //       }
  //       const descriptors = await bleManager.descriptorsForDevice(deviceId, service.uuid, characteristic.uuid);
  //       for (const descriptor of descriptors) {
  //         const descriptor2 = { ...descriptor };
  //         characteristic2.descriptors.push(descriptor2);
  //         // Object.assign(characteristic2, { [descriptor.uuid as keyof typeof characteristic2]: descriptor2 });
  //       }

  //     }
  //   }

  //   log.debug("Device services and characteristics: ", JSON.stringify(info, null, 2));

  // }

  function onCharacteristicUpdate(error: Error | null, characteristic: Characteristic | null) {
    if (error) {
      log.error("Error monitoring characteristic: ", error);
    } else if (characteristic) {
      log.info("Received characteristic update: ", characteristic.value);
      if (characteristic.uuid === UUID_NOTIFY && characteristic.value) {
        // Process the notification value as needed
        // characteristicUpdateSubject.next(characteristic.value);
        eventBus && of(characteristic.value).pipe(
          transformCharValueStreamToBatteryDataPipeline,
          map((batteryData) => new EventDefault(EventType.BatteryUpdate, batteryData))
        ).subscribe(eventBus);

      } else {
        log.warn("Received update for unhandled characteristic UUID: ", characteristic.uuid, characteristic.value);
      }
    }
  }


  async function monitorCharacteristic(deviceId: string, serviceUUID: string, characteristicUUID: string) {
    log.info("Monitoring characteristic for device: ", deviceId, "serviceUUID: ", serviceUUID, "characteristicUUID: ", characteristicUUID);

    const device = await getConnectedAndDiscoveredDevice(deviceId);
    // eventBus?.next(new EventDefault(EventType.DeviceConnected, device));
    // dumpServicesForDevice(device.id);
    bleManager.monitorCharacteristicForDevice(device.id, serviceUUID, characteristicUUID, onCharacteristicUpdate);
    

  }

  async function disconnectFromBattery(id: DeviceId) {
    log.info("Disconnecting from device with ID: ", id);
    try {
      await bleManager.cancelDeviceConnection(id);
      log.info("Successfully disconnected from device with ID: ", id);
    } catch (error) {
      log.error("Error disconnecting from device with ID: ", id, error);
    }
  }

  // function stringToBytes(str: string): Uint8Array {
  //   const bytes = new Uint8Array(str.length);
  //   for (let i = 0; i < str.length; i++) {
  //     bytes[i] = str.charCodeAt(i);
  //   }
  //   return bytes;
  // }

  // async function dumpCharacteristicNotifications(deviceId: string, serviceUUID: string, characteristicUUID: string) {

  //   const device = await getConnectedAndDiscoveredDevice(deviceId);
  //   log.info("dumpCharacteristicNotifications for device: ", device);

  //   if (device && device.id) {
  //     bleManager.monitorCharacteristicForDevice(deviceId, serviceUUID, characteristicUUID, (error, characteristic) => {
  //       if (error) {
  //         log.error("Error monitoring characteristic: ", error);
  //         return;
  //       } else if (characteristic) {
  //         // log.info("Received characteristic update: ", characteristic.value);
  //         // bleManager.readCharacteristicForDevice(deviceId, serviceUUID, characteristicUUID).then((char) => {
  //         // onUpdate(characteristic);
  //         if (characteristic.value) {
  //           const value = base64.decode(characteristic.value);
  //           // const arr = stringToBytes(value);
  //           console.log(characteristic.value);
  //         }
  //         // console.log(characteristic.value + " (" + base64.decode(characteristic.value ? characteristic.value : "AAAA")  + ")");
  //         // });
  //       }
  //     });
  //   }
  // }

  function connectToBattery(id: DeviceId): void {
    log.info("BLEService: connectToBattery called");
    bleManager.stopDeviceScan();
    monitorCharacteristic(id, UUID_SERVICE, UUID_NOTIFY);
  }

  function isScanning(): boolean {
    return _isScanning;
  }


  return {
    isScanning,
    scanForDevices,
    stopScanning,
    connectToBattery,
    disconnectFromBattery,
    setEventBus
  };
}

