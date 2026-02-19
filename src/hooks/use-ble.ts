import { useState, useEffect, useMemo, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, BleError, Characteristic } from 'react-native-ble-plx';
import * as ExpoDevice from 'expo-device';
import { decode } from 'base-64';

// Standard Bluetooth GATT UUIDs
const BATTERY_SERVICE_UUID = '180f';
const BATTERY_LEVEL_CHAR_UUID = '2a19';

// Placeholder for custom BMS UUIDs (Example: JBD/Daly/Victron)
const CUSTOM_BMS_SERVICE_UUID = '0000ff00-0000-1000-8000-00805f9b34fb'; 
const CUSTOM_BMS_NOTIFY_CHAR_UUID = '0000ff01-0000-1000-8000-00805f9b34fb';

export interface BatteryMetrics {
  soc: number;
  voltage: number;
  current: number;
  temperature: number;
  status: string;
}

export function useBLE() {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [batteryMetrics, setBatteryMetrics] = useState<BatteryMetrics>({
    soc: 0,
    voltage: 0,
    current: 0,
    temperature: 0,
    status: 'Disconnected',
  });

  const requestPermissions = async () => {
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
  };

  const decodeBLEData = (value: string | null) => {
    if (!value) return null;
    const decodedValue = decode(value);
    const buffer = new Uint8Array(decodedValue.length);
    for (let i = 0; i < decodedValue.length; i++) {
      buffer[i] = decodedValue.charCodeAt(i);
    }
    return buffer;
  };

  const handleBatteryDataUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
    if (error) {
      console.log('BLE Monitor Error:', error);
      return;
    }
    if (!characteristic?.value) return;

    const data = decodeBLEData(characteristic.value);
    if (!data) return;

    // Example logic for standard Battery Level (1 byte)
    if (characteristic.uuid.toLowerCase() === BATTERY_LEVEL_CHAR_UUID) {
      setBatteryMetrics((prev) => ({ ...prev, soc: data[0], status: 'Connected' }));
    }

    // Example for Custom BMS logic (simplified)
    // Here you would add the specific byte parsing for your BMS model
    // if (characteristic.uuid === CUSTOM_BMS_NOTIFY_CHAR_UUID) { ... }
  };

  const startMonitoring = useCallback(async (device: Device) => {
    try {
      // Monitor Standard Battery Level
      device.monitorCharacteristicForService(
        BATTERY_SERVICE_UUID,
        BATTERY_LEVEL_CHAR_UUID,
        handleBatteryDataUpdate
      );

      // (Optional) Monitor Custom BMS telemetry
      // device.monitorCharacteristicForService(CUSTOM_BMS_SERVICE_UUID, CUSTOM_BMS_NOTIFY_CHAR_UUID, handleBatteryDataUpdate);

      console.log('Started monitoring services for:', device.name);
    } catch (e) {
      console.log('Monitoring failed:', e);
    }
  }, []);

  const scanForDevices = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('Scan error:', error);
        return;
      }
      if (device && (device.name || device.localName)) {
        setAllDevices((prev) => {
          if (prev.findIndex((d) => d.id === device.id) === -1) {
            return [...prev, device];
          }
          return prev;
        });
      }
    });
  };

  const connectToDevice = async (device: Device) => {
    try {
      bleManager.stopDeviceScan();
      const deviceConnection = await bleManager.connectToDevice(device.id, { autoConnect: true });
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      
      // Setup listener for disconnections
      bleManager.onDeviceDisconnected(device.id, () => {
        setConnectedDevice(null);
        setBatteryMetrics((prev) => ({ ...prev, status: 'Disconnected' }));
        console.log('Device Disconnected');
      });

      startMonitoring(deviceConnection);
    } catch (e) {
      console.log('Connection failed:', e);
    }
  };

  const disconnectFromDevice = async () => {
    if (connectedDevice) {
      await bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
    }
  };

  return {
    scanForDevices,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
    requestPermissions,
    stopScanning: () => bleManager.stopDeviceScan(),
    batteryMetrics,
  };
}
