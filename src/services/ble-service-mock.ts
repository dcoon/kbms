
import { BatteryData } from "@/constants/battery-types";
import { BLEServiceInterface, Device } from "@/services/ble-service";
import { blelog as log } from '@/services/log';
import { BleError, Characteristic, DeviceId } from "react-native-ble-plx";

/**
 * A mock Device object for testing purposes when BLE is not available.
 * It uses Partial<Device> to satisfy component requirements without implementing 
 * all class methods of react-native-ble-plx Device.
 */
export const mockDevice: Device = {
  id: 'DE:AD:BE:EF:00:01',
  name: 'Sample BLE Heart Rate Monitor',
  localName: 'HeartRate_Mock',
  rssi: -58,
  mtu: 23,
  isConnectable: true,
  manufacturerData: null,
  serviceData: null,
  serviceUUIDs: ['180d'],
  txPowerLevel: null,
  solicitedServiceUUIDs: null,
  overflowServiceUUIDs: null,
};

/**
 * Generates an array of mock devices for UI testing.
 */
export const generateMockDevices = (count: number): Device[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `00:11:22:33:44:0${i}`,
    name: `Mock Device ${i + 1}`,
    localName: `MOCK_${i + 1}`,
    rssi: -50 - Math.floor(Math.random() * 40),
  }));
};

/**
 * A mock implementation of the BLEServiceInterface, which does not
 * perform any actual Bluetooth operations. It is intended to be
 * used in development environments where Bluetooth is not available.
 * @returns {BLEServiceInterface} A mock BLE service interface.
 */
export function BLEServiceMock (): BLEServiceInterface {

    log.info("BLEServiceMock: ");

    let devices: Device[] = [];
    let isScanning = false;

  

    function scanForDevices(onDeviceFound: (device: Device) => void, onError: (error: BleError) => void): void {
        log.info("BLEServiceMock: scanForDevices called");
        isScanning = true;
        devices = generateMockDevices(5);
        for (const device of devices) {
          onDeviceFound(device as Device);
        };
        
      
    }
    
    function stopScanning(): void {
      log.info("BLEServiceMock: stopScanning called");
      isScanning = false;
      devices.length = 0;
      return;
    }

    function getDevices(): Device[] {
      log.info("BLEServiceMock: getDevices called");
      return devices;
    }

    function monitorCharacteristic(deviceId: string, serviceUUID: string, characteristicUUID: string, onUpdate: (error: Error | null , characteristic: Characteristic | null) => void): () => void {
      log.info("BLEServiceMock: monitorCharacteristic called for deviceId:", deviceId, "serviceUUID:", serviceUUID, "characteristicUUID:", characteristicUUID);
      const interval = setInterval(() => {
        onUpdate(null, null); // Mock data update
      }, 3000);

      return () => {
        log.info("BLEServiceMock: Unmonitoring characteristic for deviceId:", deviceId);
        clearInterval(interval);
      };    
    }
          



    function connectToBattery(id: DeviceId, onBatteryUpdate: (data: BatteryData) => void): void {  
      log.info("BLEServiceMock: connectToBattery called");    
      const interval = setInterval(() => {
        const mockBatteryData: BatteryData = {  
          soc: Math.floor(Math.random() * 100),
          voltage: Math.floor(Math.random() * 100),
          current: Math.floor(Math.random() * 100),
          temperature: Math.floor(Math.random() * 100),
          capacity: Math.floor(Math.random() * 100),
          cycles: Math.floor(Math.random() * 1000),
          status: Math.random() > 0.5 ? 'Healthy' : 'Warning'
          // batteryLevel: Math.floor(Math.random() * 100),
          // stateOfHealth: Math.floor(Math.random() * 100),
          // stateOfFunction: Math.random() > 0.5 ? 'Charging' : 'Discharging',
          // cycleCount: Math.floor(Math.random() * 1000)

        };
        onBatteryUpdate(mockBatteryData);
      }, 3000);
    } 

    function disconnectFromBattery(): void {
      log.info("BLEServiceMock: disconnectFromBattery called");    
      return; 
    }

  //     useEffect(() => {
  //   if (Device.isDevice && connectedDevice) {
  //     setBatteryData(prev => ({
  //       ...prev,
  //       soc: batteryMetrics.soc > 0 ? batteryMetrics.soc : prev.soc,
  //     }));
  //     return;
  //   }

  //   const interval = setInterval(() => {
  //     setBatteryData(prev => ({
  //       ...prev,
  //       voltage: +(prev.voltage + (Math.random() * 0.1 - 0.05)).toFixed(2),
  //       current: +(prev.current + (Math.random() * 0.5 - 0.25)).toFixed(2),
  //       soc: Math.max(0, Math.min(100, +(prev.soc + (Math.random() * 0.1 - 0.05)).toFixed(1))),
  //     }));
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, [connectedDevice, batteryMetrics]);


  return {
    isScanning,
    scanForDevices,
    stopScanning,
    getDevices,
    connectToBattery
  }; 
}
