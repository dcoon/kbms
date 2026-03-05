import { useState, useCallback, useRef } from 'react';
import { Device } from 'react-native-ble-plx';
import { bleService, BatteryMetrics } from '../services/ble-service';
import * as ExpoDevice from 'expo-device';
import { MOCK_DEVICES } from '../constants/mock-data';
import { Platform } from 'react-native';
import { decode } from 'base-64';
import base64 from 'react-native-base64';

export type AugmentedDevice = {
  id: string;
  name: string;
  rssi: number;
  lastSeen: number;
  isMock?: boolean;
  nativeDevice?: Device;
  manufacturerData?: string;
  manufacturerId?: string;
};

export function useBLE() {
  const [allDevices, setAllDevices] = useState<AugmentedDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [batteryMetrics, setBatteryMetrics] = useState<BatteryMetrics>(bleService.getMetrics());
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isPhysicalDevice = () => {
    return ExpoDevice.isDevice && Platform.OS !== 'web'
  };
  
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onDeviceFound = useCallback((device: Device) => {
    setAllDevices((prev) => {
      let manufacturerDataHex: string | undefined;
      let manufacturerId: string | undefined;

      console.log("Device found: ", device.id, device.localName, device.name);
      if (device.manufacturerData) {
        try {
            // manufacturerDataHex = base64.decode(device.manufacturerData);
            
              const data = base64.decode(device.manufacturerData);
              
              const encoder = new TextEncoder();
              const arr = encoder.encode(device.manufacturerData);
              const id = arr.subarray(0, 2);
              // const manufacturerId = (id[0] & 0xFF).toString(16);
              console.log("Services: ", device.serviceUUIDs);
          // if (manufacturerDataHex.length >= 4) {
          //   manufacturerId = manufacturerDataHex.substring(0, 4);
          // }
        } catch (e) {
          console.warn('Failed to decode manufacturerData', e);
        }
      }

      const augmented: AugmentedDevice = {
        id: device.id,
        name: device.name || device.localName || 'Unnamed Device',
        rssi: device.rssi || 0,
        lastSeen: Date.now(),
        nativeDevice: device,
        manufacturerData: manufacturerDataHex,
        manufacturerId: manufacturerId,
      };
      
      const index = prev.findIndex((d) => d.id === device.id);
      if (index === -1) {
        return [...prev, augmented];
      }
      const next = [...prev];
      next[index] = augmented;
      return next;
    });
  }, []);

  const onMetricsUpdate = useCallback((metrics: BatteryMetrics) => {
    setBatteryMetrics({ ...metrics });
  }, []);

  const onDisconnect = useCallback(() => {
    setConnectedDevice(null);
    setBatteryMetrics(bleService.getMetrics());
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    if (isPhysicalDevice()) {
      bleService.stopScanning();
    }
  }, []);

  const scanForDevices = useCallback(async () => {
    setError(null);
    setIsScanning(true);
    setAllDevices([]);

    if (!isPhysicalDevice()) {
      // Mock scanning logic
      scanTimeoutRef.current = setTimeout(() => {
        setAllDevices(MOCK_DEVICES.map(d => ({ ...d, isMock: true })));
        setIsScanning(false);
      }, 2000);
      return;
    }


    try {
      const hasPermissions = await bleService.requestPermissions();
      if (!hasPermissions) {
        setError('Bluetooth permissions denied');
        setIsScanning(false);
        return;
      }

      bleService.scanForDevices(onDeviceFound, (err) => {
        setError(err.message || 'An error occurred during scanning');
        stopScanning();
      });

      // Auto-stop scanning after 10 seconds
      scanTimeoutRef.current = setTimeout(() => {
        stopScanning();
      }, 10000);
    } catch (e: any) {
      setError(e.message || 'Failed to start scanning');
      setIsScanning(false);
    }
  }, [onDeviceFound, stopScanning]);

  const connectToDevice = useCallback(async (device: AugmentedDevice) => {
    if (device.isMock || !isPhysicalDevice()) {
      console.log('Mock connection established to:', device.name);
      return;
    }

    let nativeDevice = device.nativeDevice;
    if (!nativeDevice) {
      nativeDevice = bleService.getDiscoveredDevice(device.id);
    }

    if (!nativeDevice) {
      setError('Native device object missing');
      return;
    }

    try {
      await bleService.connectToDevice(nativeDevice, onDisconnect, onMetricsUpdate);
      setConnectedDevice(bleService.getConnectedDevice());
      console.log("Connection established to:", device.id);
    } catch (e: any) {
      setError(e.message || 'Connection failed');
      console.log('Connection failed:', e);
    }
  }, [onDisconnect, onMetricsUpdate]);

  const disconnectFromDevice = useCallback(async () => {
    if (!isPhysicalDevice()) {
      console.log('Mock disconnection');
      return;
    }
    try {
      await bleService.disconnectFromDevice();
      onDisconnect();
    } catch (e: any) {
      setError(e.message || 'Disconnection failed');
    }
  }, [onDisconnect]);

  return {
    scanForDevices,
    stopScanning,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    connectToDevice,
    requestPermissions: () => bleService.requestPermissions(),
    batteryMetrics,
    isScanning,
    error,
  };
}
