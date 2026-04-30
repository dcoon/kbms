
import { blelog as log } from '@/services/log/log-service';
// import { Base64, BleError, BleManager, Characteristic, ConnectionPriority, Descriptor, Device as BleDevice, DeviceId, LogLevel, Service, State, Subscription, TransactionId, UUID } from "react-native-ble-plx";
// import { BleError, BleManager, Characteristic, Descriptor, Device, DeviceId, Service, State, Subscription, TransactionId, UUID } from 'react-native-ble-plx';
import { Base64, BleError, BleManager, Characteristic, CharacteristicSubscriptionType, ConnectionPriority, Descriptor, Device, DeviceId, LogLevel, ScanOptions, Service, State, Subscription, TransactionId, UUID } from 'react-native-ble-plx';
// import { interval } from 'rxjs';
import { CharacteristicUpdateListener, DeviceUpdateListener } from './ble';
import { MockCharacteristic, MockDataGenerator, MockDevice, MockService, TEST_BATTERY_DATA } from './ble-manager-mock-types';

const LOG_SRC = "MockBleService";


export class BleManagerMock implements BleManager {


  constructor() {
    this._devices = this._mockDataGenerator.initMockData();
  }

  // mock data
  private _mockDataGenerator = new MockDataGenerator();
  private _devices = [] as Device[];
  private _scanningSubscription: Subscription | null = null;


  // BleManager Implementation

  destroy(): Promise<void> {
    return Promise.reject(Error("destroy is not implemented in MockBleService"));
  }

  setLogLevel(logLevel: LogLevel): Promise<LogLevel> {
    return Promise.reject(Error("setLogLevel is not implemented in MockBleService"));
  }


  logLevel(): Promise<LogLevel> {
    return Promise.reject(Error("logLevel is not implemented in MockBleService"));
  }

  cancelTransaction(transactionId: TransactionId): Promise<void> {
    return Promise.reject(Error("cancelTransaction is not implemented in MockBleService"));
  }


  enable(transactionId?: TransactionId): Promise<BleManager> {
    return Promise.reject(Error("enable is not implemented in MockBleService"));
  }

  disable(transactionId?: TransactionId): Promise<BleManager> {
    return Promise.reject(Error("disable is not implemented in MockBleService"));
  }

  // onStateChange(listener: (newState: State) => void, emitCurrentState?: boolean): Subscription

  onStateChange(listener: (newState: State) => void, emitCurrentState?: boolean): Subscription {
    listener(State.Unsupported);
    return { remove: () => { } } as Subscription;
  }

  state(): Promise<State> {
    throw Error("state is not implemented in MockBleService");
  }


  startDeviceScan(UUIDs: UUID[] | null, options: ScanOptions | null, listener: (error: BleError | null, scannedDevice: Device | null) => void): Promise<void> {


    log.info(LOG_SRC, ": scanForDevices called");

    if (this._scanningSubscription) {
      log.warn(LOG_SRC, ": scanForDevices called while already scanning");
      this.stopDeviceScan();
    }

    if (UUIDs) {
      log.warn(LOG_SRC, ": scanForDevices called with serviceUUIDs: ", UUIDs);
    }


    this._scanningSubscription = this.emitRandomDeviceUpdates(listener);


    return Promise.resolve();
  }


  stopDeviceScan(): Promise<void> {
    log.info(LOG_SRC, ": stopScanning called");
    if (this._scanningSubscription) {
      this._scanningSubscription.remove();
      this._scanningSubscription = null;
    }

    return Promise.resolve();
  }


  requestConnectionPriorityForDevice(deviceIdentifier: DeviceId, connectionPriority: ConnectionPriority, transactionId?: TransactionId): Promise<Device> {
    throw Error("requestConnectionPriorityForDevice is not implemented in MockBleService");
  }

  readRSSIForDevice(deviceIdentifier: DeviceId, transactionId?: TransactionId): Promise<Device> {
    throw Error("readRSSIForDevice is not implemented in MockBleService");
  }

  requestMTUForDevice(deviceIdentifier: DeviceId, mtu: number, transactionId?: TransactionId): Promise<Device> {
    throw Error("requestMTUForDevice is not implemented in MockBleService");
  }


  public devices: (ids: DeviceId[]) => Promise<Device[]> = (ids) => {
    log.debug(LOG_SRC, ": devices called");
    return Promise.resolve(this._devices);
  }

  connectedDevices(serviceUUIDs: UUID[]): Promise<Device[]> {
    if (serviceUUIDs) {
      return Promise.resolve(this._devices.filter((d) => (d as MockDevice)._services.some(s => serviceUUIDs.includes(s.uuid)))

      );
    }

    return this.devices([]);
  }


  connectToDevice(deviceId: DeviceId): Promise<Device> {

    const device = this._devices.find(d => d.id === deviceId) as MockDevice;

    if (device) {
      if (device._isTestDeviceThatShouldFailConnection) {
        log.warn(LOG_SRC, ": connectToDevice called with deviceId: ", deviceId, " which is a mock device that simulates connection failure.");
        return Promise.reject(Error("Failed to connect to device " + deviceId));
      }
      device._isConnected = true;
      // log.debug(LOG_SRC, ": connectToDevice called with deviceId: ", device);
      return Promise.resolve(device);
    } else {
      return Promise.reject(this);
    }
  }

  cancelDeviceConnection(deviceIdentifier: DeviceId): Promise<Device> {
    log.debug(LOG_SRC, ": cancelDeviceConnection called with deviceIdentifier: ", deviceIdentifier);
    const device = this._devices.find(d => d.id === deviceIdentifier) as MockDevice;
    if (device) {
      device._isConnected = false;
      return Promise.resolve(device);
    } else {
      return Promise.reject(this);
    }
  }

  onDeviceDisconnected(deviceIdentifier: DeviceId, listener: (error: BleError | null, device: Device | null) => void): Subscription {
    throw Error("onDeviceDisconnected is not implemented in MockBleService");
  }


  isDeviceConnected(deviceIdentifier: DeviceId): Promise<boolean> {
    const device = this._devices.find(d => d.id === deviceIdentifier) as MockDevice;
    return Promise.resolve(device && device._isConnected);
  }


  async discoverAllServicesAndCharacteristicsForDevice(deviceIdentifier: DeviceId, transactionId?: TransactionId): Promise<Device> {

    const device = this._devices.find(d => d.id === deviceIdentifier) as MockDevice;
    if (device && !device._isConnected) {
      return Promise.reject(Error("Device not connected: " + deviceIdentifier));
    } else if (device) {
      return Promise.resolve(device);
    } else {
      return Promise.reject(Error("Device not found: " + deviceIdentifier));
    }
  }

  servicesForDevice(deviceIdentifier: DeviceId): Promise<Service[]> {
    // log.debug(LOG_SRC, ": servicesForDevice called with deviceIdentifier: ", deviceIdentifier);
    const device = this._devices.find(d => d.id === deviceIdentifier) as MockDevice;
    return device ? Promise.resolve(device._services) : Promise.reject(Error("Device not found: " + deviceIdentifier));
  }

  characteristicsForDevice(deviceIdentifier: DeviceId, serviceUUID: UUID): Promise<Characteristic[]> {
    const LOG_PREFIX = LOG_SRC + ": characteristicsForDevice";
    const characteristics = this._characteristicssForDevice(deviceIdentifier, serviceUUID);
    // log.debug(LOG_PREFIX, "returning characteristics: ", deviceIdentifier, serviceUUID, characteristics?.length);
    return characteristics ? Promise.resolve(characteristics) : Promise.reject(Error("Device or service not found: " + deviceIdentifier + ", service " + serviceUUID));

  }

  descriptorsForDevice(deviceId: DeviceId, serviceUUID: UUID, characteristicUUID: UUID): Promise<Descriptor[]> {
    log.debug(LOG_SRC, ": descriptorForDevice called with deviceId: ", deviceId, "serviceUUID: ", serviceUUID, "characteristicUUID: ", characteristicUUID);
    const characteristic = this._characteristicForDevice(deviceId, serviceUUID, characteristicUUID) as MockCharacteristic;
    return characteristic ? Promise.resolve(characteristic._descriptors) : Promise.reject(Error("Device, service or characteristic not found: " + deviceId + ", service " + serviceUUID + ", characteristic " + characteristicUUID));

  }


  readCharacteristicForDevice(deviceId: DeviceId, serviceUUID: UUID, characteristicUUID: UUID): Promise<Characteristic> {
    const LOG_PREFIX = LOG_SRC + ": readCharacteristicForDevice";

    const characteristic = this._characteristicForDevice(deviceId, serviceUUID, characteristicUUID) as MockCharacteristic;
    if (characteristic) {
      characteristic.value = this._mockDataGenerator.randomValue();

    }
    log.debug(LOG_PREFIX, "[Device, Service, Characteristic] Value, isNotifying: ", deviceId, serviceUUID, characteristicUUID, characteristic?.value, characteristic?.isNotifying, characteristic?.value);

    return characteristic ? Promise.resolve(characteristic) : Promise.reject(Error("Device, service or characteristic not found: " + deviceId + ", service " + serviceUUID + ", characteristic " + characteristicUUID));
  }

  writeCharacteristicWithResponseForDevice(deviceIdentifier: DeviceId, serviceUUID: UUID, characteristicUUID: UUID, base64Value: Base64, transactionId?: TransactionId): Promise<Characteristic> {
    return Promise.reject(Error("writeCharacteristicWithResponseForDevice is not implemented in MockBleService"));
  }

  writeCharacteristicWithoutResponseForDevice(deviceIdentifier: DeviceId, serviceUUID: UUID, characteristicUUID: UUID, base64Value: Base64, transactionId?: TransactionId): Promise<Characteristic> {
    // return Promise.reject(Error("writeCharacteristicWithoutResponseForDevice is not implemented in MockBleService"));

    const characteristic = this._characteristicForDevice(deviceIdentifier, serviceUUID, characteristicUUID) as MockCharacteristic;
    characteristic.value = base64Value;

    return Promise.resolve(characteristic);
  }

  monitorCharacteristicValue(deviceId: DeviceId, serviceUUID: UUID, characteristicUUID: UUID, onValueChange: CharacteristicUpdateListener): void {
  }

  publlishCharacteristicValue(characteristic: Characteristic, listener: (error: BleError | null, characteristic: Characteristic | null) => void, value?: Base64) {

    if (value) {
      characteristic.value = value;
    } else {
      characteristic.value = this._mockDataGenerator.randomValue();

    }

    listener(null, characteristic);
  }


  monitorCharacteristicForDevice(deviceIdentifier: DeviceId, serviceUUID: UUID, characteristicUUID: UUID, listener: (error: BleError | null, characteristic: Characteristic | null) => void, transactionId?: TransactionId, subscriptionType?: CharacteristicSubscriptionType): Subscription {

    const LOG_PREFIX = LOG_SRC + ": monitorCharacteristicForDevice";

    log.info(LOG_PREFIX, "Subscribing to notifications ", deviceIdentifier, serviceUUID, characteristicUUID);

    const characteristic = this._characteristicForDevice(deviceIdentifier, serviceUUID, characteristicUUID) as MockCharacteristic;

    if (!characteristic) {
      log.warn(LOG_PREFIX, "Characteristic not found: ", deviceIdentifier, serviceUUID, characteristicUUID);
      throw Error("Characteristic not found: " + deviceIdentifier + ", service " + serviceUUID + ", characteristic " + characteristicUUID);
    }

    characteristic.isNotifying = true;


    // const ids = TEST_DEVICE_IDS;

    const data = TEST_BATTERY_DATA
      .filter(record => record.deviceId === deviceIdentifier)
      .map(record => record.value);

    const subscription = {

      i: 0,

      interval: setInterval(() => {
        this.publlishCharacteristicValue(characteristic, listener, data[subscription.i]);
        subscription.i = subscription.i < data.length - 1 ? subscription.i + 1 : 0;
      }, 100),

      remove: () => {
        clearInterval(subscription.interval);
        characteristic.isNotifying = false;
        log.info(LOG_PREFIX, "Unsubscribing from notifications ", deviceIdentifier, serviceUUID, characteristicUUID);
      }
    }
    return subscription;

  }







  readDescriptorForDevice(deviceIdentifier: DeviceId, serviceUUID: UUID, characteristicUUID: UUID, descriptorUUID: UUID, transactionId?: string): Promise<Descriptor> {
    return Promise.reject(Error("readDescriptorForDevice is not implemented in MockBleService"));
  }

  writeDescriptorForDevice(deviceIdentifier: DeviceId, serviceUUID: UUID, characteristicUUID: UUID, descriptorUUID: UUID, valueBase64: Base64, transactionId?: string): Promise<Descriptor> {
    return Promise.reject(Error("writeDescriptorForDevice is not implemented in MockBleService"));
  }


  // utilities

  private emitRandomDevice(onDeviceUpdated: DeviceUpdateListener) {

    const randomDevice = this._devices[Math.floor(Math.random() * this._devices.length)];
    log.debug(LOG_SRC, ": Emitting random device update for device: ", randomDevice.id);
    onDeviceUpdated(null, randomDevice);

  }


  private emitRandomDeviceUpdates(onDeviceUpdated: DeviceUpdateListener): Subscription {

    const EMIT_INTERVAL_MS = 50;

    const subscription = {
      interval: setInterval(() => {
        this.emitRandomDevice(onDeviceUpdated);
      }, EMIT_INTERVAL_MS),

      remove: () => {
        clearInterval(subscription.interval);
      }

    }


    return subscription;
  }

  private _characteristicssForDevice(deviceIdentifier: DeviceId, serviceUUID: UUID): Characteristic[] | null {

    const LOG_PREFIX = LOG_SRC + ": _characteristicssForDevice";

    log.debug(LOG_PREFIX, "characteristicsForDevice called with deviceIdentifier: ", deviceIdentifier, "serviceUUID: ", serviceUUID);
    const device = this._devices.find(d => d.id === deviceIdentifier) as MockDevice;
    if (device) {
      const services = device._services;
      log.debug(LOG_PREFIX, ": characteristicsForDevice found services: ", services.length);
      const service = services.find(s => s.uuid === serviceUUID) as MockService;
      log.debug(LOG_PREFIX, ": characteristicsForDevice found service: ", service.uuid);
      if (service) {
        const characteristics = service._characteristics;

        return characteristics;
      }
    }

    return null;

  }

  private _characteristicForDevice(deviceIdentifier: DeviceId, serviceUUID: UUID, characteristicUUID: UUID): Characteristic | null {

    const characteristics = this._characteristicssForDevice(deviceIdentifier, serviceUUID);
    if (characteristics) {
      const characteristic = characteristics.find(c => c.uuid === characteristicUUID) as MockCharacteristic;
      return characteristic || null;
    }
    return null;

  }

  private stopMonitoringCharacteristicValue(deviceId: DeviceId, serviceUUID: UUID, characteristicUUID: UUID): void {
    log.info(LOG_SRC, ": stopMonitoringCharacteristicValue called with deviceId: ", deviceId, "serviceUUID: ", serviceUUID, "characteristicUUID: ", characteristicUUID);
    const characteristic = this._characteristicForDevice(deviceId, serviceUUID, characteristicUUID) as MockCharacteristic;
    characteristic.isNotifying = false;
    // this._onCharacteristicValueChanged && this._onCharacteristicValueChanged(null, characteristic);
  }



}