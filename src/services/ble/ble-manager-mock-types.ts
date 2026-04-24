import { Base64, BleError, Characteristic, CharacteristicSubscriptionType, ConnectionOptions, Descriptor, Device, Service, Subscription, TransactionId, UUID } from 'react-native-ble-plx';
import { KV_BATTERY_NOTIFY_UUID, KV_BATTERY_SERVICE_UUID } from '../manufacturers/kilovault/battery-data-types';

const LOG_SRC = "MockBleManager";

type ServiceDataMap = typeof Device.prototype.serviceData;




export class MockDevice implements Device {

  id: typeof Device.prototype.id = "";
  name: typeof Device.prototype.name = "";
  rssi: typeof Device.prototype.rssi = null;
  mtu: typeof Device.prototype.mtu = -1;
  manufacturerData: typeof Device.prototype.manufacturerData = null;
  rawScanRecord: typeof Device.prototype.rawScanRecord = "";
  serviceData: typeof Device.prototype.serviceData = null;
  serviceUUIDs: typeof Device.prototype.serviceUUIDs = [];
  localName: typeof Device.prototype.localName = null;

  txPowerLevel: typeof Device.prototype.txPowerLevel = null;
  solicitedServiceUUIDs: typeof Device.prototype.solicitedServiceUUIDs = [];
  isConnectable: typeof Device.prototype.isConnectable = false;
  overflowServiceUUIDs: typeof Device.prototype.overflowServiceUUIDs = [];

  _services: Service[] = [];
  _isConnected: boolean = false;
  _isTestDeviceThatShouldFailConnection: boolean = false;


  constructor(init: any) {

    Object.assign(this, init);
  }


  isBattery(): boolean {
    const service = this._services.find(service => service.uuid === KV_BATTERY_SERVICE_UUID);
    const characteristic = (service as MockService)?._characteristics.find(characteristic => characteristic.uuid === KV_BATTERY_NOTIFY_UUID);

    return service && characteristic ? true : false;
  }

  isConnected(): Promise<boolean> {
    return Promise.resolve(this._isConnected);
  }

  requestConnectionPriority(): Promise<Device> {
    return Promise.reject(new Error("requestConnectionPriority is not implemented in MockBleService"));
  }

  readRSSI(): Promise<Device> {
    return Promise.reject(new Error("readRSSI is not implemented in MockBleService"));
  }

  requestMTU(mtu: number, transactionId?: TransactionId): Promise<Device> {
    return Promise.reject(new Error("requestMTU is not implemented in MockBleService"));
  }

  connect(options?: ConnectionOptions): Promise<Device> {
    return Promise.reject(new Error("connect is not implemented in MockBleService"));
  }

  disconnect(): Promise<Device> {
    return Promise.reject(new Error("disconnect is not implemented in MockBleService"));
  }

  cancelConnection(): Promise<Device> {
    return Promise.reject(new Error("cancelConnection is not implemented in MockBleService"));
  }

  onDisconnected(listener: (error: BleError | null, device: Device) => void): Subscription {
    throw new Error("onDisconnected is not implemented in MockBleService");
  }

  discoverAllServicesAndCharacteristics(transactionId?: TransactionId): Promise<Device> {
    return Promise.reject(new Error("discoverAllServicesAndCharacteristics is not implemented in MockBleService"));
  }
  services(): Promise<Service[]> {
    return Promise.reject(new Error("services is not implemented in MockBleService"));
  }

  characteristicsForService(serviceUUID: string): Promise<Characteristic[]> {
    return Promise.reject(new Error("characteristicsForService is not implemented in MockBleService"));
  }

  descriptorsForService(serviceUUID: UUID, characteristicUUID: UUID): Promise<Descriptor[]> {
    return Promise.reject(new Error("descriptorsForService is not implemented in MockBleService"));
  }

  readCharacteristicForService(serviceUUID: UUID, characteristicUUID: UUID, transactionId?: TransactionId): Promise<Characteristic> {
    return Promise.reject(new Error("readCharacteristicForService is not implemented in MockBleService"));
  }

  writeCharacteristicWithResponseForService(serviceUUID: UUID, characteristicUUID: UUID, valueBase64: Base64, transactionId?: TransactionId): Promise<Characteristic> {
    return Promise.reject(new Error("writeCharacteristicWithResponseForService is not implemented in MockBleService"));
  }

  writeCharacteristicWithoutResponseForService(serviceUUID: UUID, characteristicUUID: UUID, valueBase64: Base64, transactionId?: TransactionId): Promise<Characteristic> {
    return Promise.reject(new Error("writeCharacteristicWithoutResponseForService is not implemented in MockBleService"));
  }

  monitorCharacteristicForService(serviceUUID: UUID, characteristicUUID: UUID, listener: (error: BleError | null, characteristic: Characteristic | null) => void, transactionId?: TransactionId, subscriptionType?: CharacteristicSubscriptionType): Subscription {
    throw new Error("monitorCharacteristicForService is not implemented in MockBleService");
  }

  stopMonitoringCharacteristicForService(serviceUUID: UUID, characteristicUUID: UUID, transactionId?: TransactionId): Promise<Characteristic> {
    return Promise.reject(new Error("stopMonitoringCharacteristicForService is not implemented in MockBleService"));
  }

  readDescriptorForService(serviceUUID: UUID, characteristicUUID: UUID, descriptorUUID: UUID, transactionId?: string): Promise<Descriptor> {
    return Promise.reject(new Error("readDescriptorForService is not implemented in MockBleService"));
  }

  writeDescriptorForService(serviceUUID: UUID, characteristicUUID: UUID, descriptorUUID: UUID, valueBase64: Base64, transactionId?: string): Promise<Descriptor> {
    return Promise.reject(new Error("writeDescriptorForService is not implemented in MockBleService"));
  }

}
export class MockService implements Service {

  id: typeof Service.prototype.id = 0;
  uuid: typeof Service.prototype.uuid = "";
  deviceID: typeof Service.prototype.deviceID = "";
  isPrimary: typeof Service.prototype.isPrimary = false;

  _characteristics: Characteristic[] = [];

  constructor(init: any) {

    Object.assign(this, init);
  }


  characteristics(): Promise<Characteristic[]> {
    return Promise.reject(new Error("characteristics is not implemented in MockBleService"));
  }

  descriptorsForCharacteristic(characteristicUUID: UUID): Promise<Descriptor[]> {
    return Promise.reject(new Error("descriptorsForCharacteristic is not implemented in MockBleService"));
  }

  readCharacteristic(characteristicUUID: UUID, transactionId?: TransactionId): Promise<Characteristic> {
    return Promise.reject(new Error("readCharacteristic is not implemented in MockBleService"));
  }

  writeCharacteristic(characteristicUUID: UUID, valueBase64: Base64, transactionId?: TransactionId): Promise<Characteristic> {
    return Promise.reject(new Error("writeCharacteristic is not implemented in MockBleService"));
  }

  writeCharacteristicWithResponse(characteristicUUID: UUID, valueBase64: Base64, transactionId?: string): Promise<Characteristic> {
    return Promise.reject(new Error("writeCharacteristicWithResponse is not implemented in MockBleService"));
  }

  writeCharacteristicWithoutResponse(characteristicUUID: UUID, valueBase64: Base64, transactionId?: string): Promise<Characteristic> {
    return Promise.reject(new Error("writeCharacteristicWithoutResponse is not implemented in MockBleService"));
  }

  monitorCharacteristic(characteristicUUID: UUID, listener: (error: BleError | null, characteristic: Characteristic | null) => void, transactionId?: string, subscriptionType?: CharacteristicSubscriptionType): Subscription {
    throw new Error("monitorCharacteristic is not implemented in MockBleService");
  }

  stopMonitoringCharacteristic(characteristicUUID: UUID, transactionId?: string): Promise<Characteristic> {
    return Promise.reject(new Error("stopMonitoringCharacteristic is not implemented in MockBleService"));
  }

  readDescriptorForCharacteristic(characteristicUUID: UUID, descriptorUUID: UUID, transactionId?: string): Promise<Descriptor> {
    return Promise.reject(new Error("readDescriptorForCharacteristic is not implemented in MockBleService"));
  }

  writeDescriptorForCharacteristic(characteristicUUID: UUID, descriptorUUID: UUID, valueBase64: Base64, transactionId?: string): Promise<Descriptor> {
    return Promise.reject(new Error("writeDescriptorForCharacteristic is not implemented in MockBleService"));
  }



}
export class MockCharacteristic implements Characteristic {

  // id: Identifier = 0;    
  id: typeof Characteristic.prototype.id = 0;
  uuid: typeof Characteristic.prototype.uuid = "";
  serviceID: typeof Characteristic.prototype.serviceID = 0;
  serviceUUID: typeof Characteristic.prototype.serviceUUID = "";
  deviceID: typeof Characteristic.prototype.deviceID = "";

  isReadable: typeof Characteristic.prototype.isReadable = false;
  isWritableWithResponse: typeof Characteristic.prototype.isWritableWithResponse = false;
  isWritableWithoutResponse: typeof Characteristic.prototype.isWritableWithoutResponse = false;
  isNotifiable: typeof Characteristic.prototype.isNotifiable = false;
  isNotifying: typeof Characteristic.prototype.isNotifying = false;
  isIndicatable: typeof Characteristic.prototype.isIndicatable = false;

  value: typeof Characteristic.prototype.value = "";

  //mock data
  _descriptors: Descriptor[] = [];

  constructor(init: any) {

    Object.assign(this, init);
  }


  descriptors(): Promise<Descriptor[]> {
    return Promise.reject(new Error("descriptors is not implemented in MockBleService"));
  }

  read(transactionId?: TransactionId): Promise<Characteristic> {
    return Promise.reject(new Error("read is not implemented in MockBleService"));
  }

  write(valueBase64: Base64, transactionId?: TransactionId): Promise<Characteristic> {
    return Promise.reject(new Error("write is not implemented in MockBleService"));
  }

  writeWithResponse(valueBase64: Base64, transactionId?: TransactionId): Promise<Characteristic> {
    return Promise.reject(new Error("writeWithResponse is not implemented in MockBleService"));
  }

  writeWithoutResponse(valueBase64: Base64, transactionId?: TransactionId): Promise<Characteristic> {
    return Promise.reject(new Error("writeWithoutResponse is not implemented in MockBleService"));
  }

  monitor(listener: (error: BleError | null, characteristic: Characteristic | null) => void, transactionId?: string, subscriptionType?: CharacteristicSubscriptionType): Subscription {
    throw new Error("monitor is not implemented in MockBleService");
  }

  readDescriptor(descriptorUUID: UUID, transactionId?: string): Promise<Descriptor> {
    return Promise.reject(new Error("readDescriptor is not implemented in MockBleService"));
  }

  writeDescriptor(descriptorUUID: UUID, valueBase64: Base64, transactionId?: string): Promise<Descriptor> {
    return Promise.reject(new Error("writeDescriptor is not implemented in MockBleService"));
  }


}
export class MockDescriptor implements Descriptor {

  _manager: typeof Descriptor.prototype._manager = undefined as any;

  id: typeof Descriptor.prototype.id = 0;
  uuid: typeof Descriptor.prototype.uuid = "";
  characteristicID: typeof Descriptor.prototype.characteristicID = 0;
  characteristicUUID: typeof Descriptor.prototype.characteristicUUID = "";
  serviceID: typeof Descriptor.prototype.serviceID = 0;
  serviceUUID: typeof Descriptor.prototype.serviceUUID = "";
  deviceID: typeof Descriptor.prototype.deviceID = "";
  value: typeof Descriptor.prototype.value = "";

  constructor(init: any) {

    Object.assign(this, init);
  }


  read(transactionId?: string): Promise<Descriptor> {
    return Promise.reject(new Error("read is not implemented in MockBleService"));
  }

  write(valueBase64: Base64, transactionId?: string): Promise<Descriptor> {
    return Promise.reject(new Error("write is not implemented in MockBleService"));
  }



}




// Generate mock data
export class MockDataGenerator {

  public static getLastDigitOfUUID(uuid: UUID): number {
    const lastDigit = uuid.split(':').slice(-1)[0];
    const lastDigitNum = parseInt(lastDigit, 16);
    return lastDigitNum;
  }

  public static shouldBeBattery(uuid: UUID): boolean {
    const lastDigit = this.getLastDigitOfUUID(uuid);
    return lastDigit <= 9; // 80% of devices will be batteries, 20% will be non-batteries that should fail connection
  }

  public static shouldFail(id: UUID): boolean {
    const lastDigitNum = this.getLastDigitOfUUID(id);
    return lastDigitNum >= 8;
  }


  public initMockData(): Device[] {

    const deviceIds = this.generateMockUUIDs(10);
    // this._devices = this.generateMockDevices(deviceIds);

    return this.generateMockDevices(deviceIds);

  }

  private generateMockUUIDs(count: number): UUID[] {

    const format = [0, 1, 2, 3, 4, 5];

    const ids = [...Array(count + 1).keys()];
    return ids.map(i => { return format.concat(i).join(':') });


  }

  private generateMockDevices(deviceIds: UUID[]): Device[] {
    const devices = deviceIds.map(id => this.generateMockDevice(id));
    return devices;
  }


  public randomRssi(): number {
    return Math.floor(Math.random() * -100 + -50);
  }

  public randomValue(): string {
    return Math.random().toString(36).substring(2, 15);
  }



  private generateMockServiceData(services: Service[]): ServiceDataMap {
    const serviceData: ServiceDataMap = {};
    services.forEach(service => {
      const key = service.uuid ? service.uuid : Math.random().toString();
      serviceData[key] = Math.random().toString();
    });
    return serviceData;
  }
  private generateMockDevice(id: UUID): Device {

    const shouldFail = MockDataGenerator.shouldFail(id);
    const shouldBeBattery = MockDataGenerator.shouldBeBattery(id);

    const serviceUUIDs = this.generateMockUUIDs(3);
    if (shouldBeBattery) {
      serviceUUIDs.push(KV_BATTERY_SERVICE_UUID);
    }
    const services = this.generateMockServices(id, serviceUUIDs);

    const device = new MockDevice({
      id: id,
      name: null,
      localName: null,
      _isTestDeviceThatShouldFailConnection: shouldFail,
      rssi: this.randomRssi(),
      manufacturerData: Math.random().toString(),

      _services: services,
      serviceUUIDs: services.map(s => s.uuid),
      solicitedServiceUUIDs: Math.random() < 0.5 ? services.map(s => s.uuid) : [],
      overflowServiceUUIDs: Math.random() < 0.5 ? services.map(s => s.uuid) : [],
      serviceData: this.generateMockServiceData(services),
      txPowerLevel: Math.floor(Math.random() * 10) - 30,


    });

    device.name = `${shouldBeBattery ? "Battery" : "Device"} ${device.id} ${shouldFail ? "(will cause connection error)" : ""}`;
    device.localName = device.name + " (local name)";




    return device;
  }

  private generateMockServices(deviceId: UUID, serviceIds: UUID[]): Service[] {
    return serviceIds.map(id => this.generateMockService(deviceId, id));
  }

  private generateMockService(deviceId: UUID, serviceUUID: UUID): Service {
    const service = new MockService({
      id: serviceUUID,
      uuid: serviceUUID,
      deviceID: deviceId,
      name: "Test Service " + serviceUUID,
      isPrimary: this.randomTrueFalse(),
    });

    const characteristicUUIDs = [...this.generateMockUUIDs(3)];
    if (serviceUUID === KV_BATTERY_SERVICE_UUID) {
      characteristicUUIDs.push(KV_BATTERY_NOTIFY_UUID);
    }
    const characteristics = this.generateMockCharacteristics(deviceId, serviceUUID, characteristicUUIDs);
    service._characteristics = characteristics;

    return service;
  }


  private randomTrueFalse(): boolean {
    return Math.random() < 0.5;
  }

  private generateMockCharacteristics(deviceId: UUID, serviceUUID: UUID, characteristicIds: UUID[]): Characteristic[] {
    return characteristicIds.map(id => this.generateMockCharacteristic(deviceId, serviceUUID, id));
  }

  private generateMockCharacteristic(deviceId: UUID, serviceUUID: UUID, id: UUID): Characteristic {
    const characteristic = new MockCharacteristic({
      uuid: id,
      serviceUUID: serviceUUID,
      deviceID: deviceId,
      id: id,
      name: "Mock Characteristic " + id,
      properties: [],
      // descriptors: [],
      value: null,
      isNotifying: false,
      isReadable: this.randomTrueFalse(),
      isWritableWithResponse: this.randomTrueFalse(),
      isWritableWithoutResponse: this.randomTrueFalse(),
      isNotifiable: this.randomTrueFalse(),
      isIndicatable: this.randomTrueFalse(),
      _descriptors: this.generateMockDescriptors(this.generateMockUUIDs(2)),
    });

    if (id === KV_BATTERY_NOTIFY_UUID) {
      characteristic.isNotifiable = true;
      characteristic.isIndicatable = true;
      characteristic.isReadable = false;
      characteristic.isWritableWithResponse = false;
      characteristic.isWritableWithoutResponse = false;
    }

    return characteristic;

  }

  private generateMockDescriptors(descriptorIds: UUID[]): Descriptor[] {
    return descriptorIds.map(id => this.generateMockDescriptor(id));
  }

  private generateMockDescriptor(id: UUID): Descriptor {
    const descriptor = new MockDescriptor(
      {
        uuid: id,
        value: Math.random().toString(),
      }
    );

    return descriptor;
  }
}

