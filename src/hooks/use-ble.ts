import { useState, useCallback } from 'react';
import { Device } from 'react-native-ble-plx';
import { bleService, BatteryMetrics } from '../services/ble-service';
import * as ExpoDevice from 'expo-device';

export type AugmentedDevice = Device & {
  lastSeen: number;
};

export function useBLE() {
  const [allDevices, setAllDevices] = useState<AugmentedDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [batteryMetrics, setBatteryMetrics] = useState<BatteryMetrics>(bleService.getMetrics());

  const onDeviceFound = useCallback((device: Device) => {
    setAllDevices((prev) => {
      const augmented: AugmentedDevice = { ...device, lastSeen: Date.now() } as AugmentedDevice;
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

  const scanForDevices = useCallback(() => {
    if (!ExpoDevice.isDevice) return;
    bleService.scanForDevices(onDeviceFound, (error) => {
      console.log('Scan error:', error);
    });
  }, [onDeviceFound]);

  const connectToDevice = useCallback(async (device: Device) => {
    if (!ExpoDevice.isDevice) return;
    try {
      await bleService.connectToDevice(device, onDisconnect, onMetricsUpdate);
      setConnectedDevice(bleService.getConnectedDevice());
    } catch (e) {
      console.log('Connection failed:', e);
    }
  }, [onDisconnect, onMetricsUpdate]);

  const disconnectFromDevice = useCallback(async () => {
    if (!ExpoDevice.isDevice) return;
    await bleService.disconnectFromDevice();
    onDisconnect();
  }, [onDisconnect]);

  // If not a physical device, return mock-compatible interface with no-ops
  if (!ExpoDevice.isDevice) {
    return {
      scanForDevices: () => console.log('BLE Scan ignored on simulator'),
      allDevices: [] as AugmentedDevice[],
      connectToDevice: async () => {},
      connectedDevice: null,
      disconnectFromDevice: async () => {},
      requestPermissions: async () => false,
      stopScanning: () => {},
      batteryMetrics: bleService.getMetrics(),
    };
  }

  return {
    scanForDevices,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
    requestPermissions: () => bleService.requestPermissions(),
    stopScanning: () => bleService.stopScanning(),
    batteryMetrics,
  };
}
