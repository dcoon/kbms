import { BleManager, Device, BleError, Characteristic, Subscription } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import * as ExpoDevice from 'expo-device';
import { decode } from 'base-64';

// Standard Bluetooth GATT UUIDs
const BATTERY_SERVICE_UUID = '180f';
const BATTERY_LEVEL_CHAR_UUID = '2a19';

export interface BatteryMetrics {
  soc: number;
  voltage: number;
  current: number;
  temperature: number;
  status: string;
}

class BLEService {
  private _bleManager: BleManager | null = null;
  private connectedDevice: Device | null = null;
  private discoveredDevices: Map<string, Device> = new Map();
  private batteryMetrics: BatteryMetrics = {
    soc: 0,
    voltage: 0,
    current: 0,
    temperature: 0,
    status: 'Disconnected',
  };

  private get bleManager(): BleManager {
    if (!this._bleManager) {
      if (!ExpoDevice.isDevice) {
        throw new Error('BLE is not supported on simulators/web');
      }
      this._bleManager = new BleManager();
    }
    return this._bleManager;
  }

  getMetrics(): BatteryMetrics {
    return this.batteryMetrics;
  }

  getConnectedDevice(): Device | null {
    return this.connectedDevice;
  }

  getDiscoveredDevice(id: string): Device | undefined {
    return this.discoveredDevices.get(id);
  }

  async requestPermissions(): Promise<boolean> {
    if (!ExpoDevice.isDevice) return false;
    if (Platform.OS === 'android') {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const bluetoothScanPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
        const bluetoothConnectPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
        const fineLocationPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return bluetoothScanPermission === 'granted' && bluetoothConnectPermission === 'granted' && fineLocationPermission === 'granted';
      }
    }
    return true;
  }

  scanForDevices(onDeviceFound: (device: Device) => void, onError: (error: BleError) => void) {
    this.bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        onError(error);
        return;
      }
      if (device && (device.name || device.localName)) {
        this.discoveredDevices.set(device.id, device);
        onDeviceFound(device);
      }
    });
  }

  stopScanning() {
    this.bleManager.stopDeviceScan();
  }

  async connectToDevice(device: Device, onDisconnect: () => void, onMetricsUpdate: (metrics: BatteryMetrics) => void) {
    try {
      this.stopScanning();
      const deviceConnection = await this.bleManager.connectToDevice(device.id, { autoConnect: true });
      this.connectedDevice = deviceConnection;
      await deviceConnection.discoverAllServicesAndCharacteristics();
      
      this.bleManager.onDeviceDisconnected(device.id, () => {
        this.connectedDevice = null;
        this.batteryMetrics.status = 'Disconnected';
        onDisconnect();
      });

      this.startMonitoring(deviceConnection, onMetricsUpdate);
    } catch (e) {
      console.log('Connection failed:', e);
      throw e;
    }
  }

  async disconnectFromDevice() {
    if (this.connectedDevice) {
      await this.bleManager.cancelDeviceConnection(this.connectedDevice.id);
      this.connectedDevice = null;
    }
  }

  private decodeBLEData(value: string | null) {
    if (!value) return null;
    const decodedValue = decode(value);
    const buffer = new Uint8Array(decodedValue.length);
    for (let i = 0; i < decodedValue.length; i++) {
      buffer[i] = decodedValue.charCodeAt(i);
    }
    return buffer;
  }

  private startMonitoring(device: Device, onMetricsUpdate: (metrics: BatteryMetrics) => void) {
    try {
      device.monitorCharacteristicForService(
        BATTERY_SERVICE_UUID,
        BATTERY_LEVEL_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.log('BLE Monitor Error:', error);
            return;
          }
          if (!characteristic?.value) return;

          const data = this.decodeBLEData(characteristic.value);
          if (!data) return;

          if (characteristic.uuid.toLowerCase() === BATTERY_LEVEL_CHAR_UUID) {
            this.batteryMetrics = { ...this.batteryMetrics, soc: data[0], status: 'Connected' };
            onMetricsUpdate(this.batteryMetrics);
          }
        }
      );
    } catch (e) {
      console.log('Monitoring failed:', e);
    }
  }
}

export const bleService = new BLEService();
