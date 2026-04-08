
import { EventBus, EventDefault, EventType } from "@/components/event-bus-provider";
import { BatteryData, BLEServiceInterface, Device } from "@/services/ble-service";
import { blelog as log } from '@/services/log';
import { DeviceId } from "react-native-ble-plx";
import { interval, map, Subscription } from "rxjs";


/**
 * A mock implementation of the BLEServiceInterface, which does not
 * perform any actual Bluetooth operations. It is intended to be
 * used in development environments where Bluetooth is not available.
 * @returns {BLEServiceInterface} A mock BLE service interface.
 */
export function BLEServiceMock(): BLEServiceInterface {

  log.info("BLEServiceMock: ");

  let scanner: Subscription | null = null;
  const numDevices = 10;
  const devicePool = generateMockDeviceIds(numDevices).map((id) => generateMockDevice(id));

  const devices: { device: Device; subscription: Subscription | null }[] = devicePool.map((device) => ({ device, subscription: null }));

  let eventBus: EventBus | null = null;

  function setEventBus(bus: EventBus) {
    log.info("BLEServiceMock: setEventBus called");
    eventBus = bus;
  }

  function isScanning(): boolean {
    return scanner !== null;
  }

  function scanForDevices(): void {
    log.info("BLEServiceMock: scanForDevices called");
    if (scanner) {
      log.debug("BLEServiceMock: scanForDevices called while already scanning");

    } else if (!eventBus) {
      log.warn("BLEServiceMock: scanForDevices called before eventBus is set. Unable to emit device scan events."); 

    } else {

      scanner = interval(1000).pipe(
        // take(10), // Scan for 5 seconds
        map(() => Math.random()),
        map((random) => Math.floor(random * devices.length)),
        map((index) => devices[index]),
        map(entry => entry.device),
                map((device) => {
          device.rssi = Math.floor(Math.random() * -100 + -50);
          return device;
        }),
        map((device) => new EventDefault(EventType.DeviceScanned, device)),

        // map((id) => new Device({ id, name: "Mock Device" + id })),
        // tap((device) => devices.push({ device, subscription: null })),
        // tap((device) => log.debug("BLEServiceMock: device found: ", device, devices)),
      ).subscribe(eventBus);
    }



  }

  function stopScanning(): void {
    log.info("BLEServiceMock: stopScanning called");
    if (scanner) {
      scanner.unsubscribe();
      scanner = null;
    }
  }

  function generateMockDeviceIds(count: number): DeviceId[] {

    const format = [0, 1, 2, 3, 4, 5];

    return Array.from({ length: count }, () => {
      const id =  Math.round(Math.random() * numDevices); // Generate a random number between 0 and numDevices
      return [...format, id].join(':'); // Format the string as a device ID (e.g., "12:34:56:78:9A:BC")
    });

  }

  function generateMockDevice(id: DeviceId): Device {
    return new Device({ id, name: "Mock Device " + id, 
      rssi: Math.floor(Math.random() * -200),
    });
  }


  function generateMockBatteryData(id: DeviceId): BatteryData {
    return {
      deviceId: id,
      voltage: +(3.7 + Math.random() * 0.1).toFixed(2),
      current: +(3.7 + Math.random() * 0.1).toFixed(2),
      soc: Math.floor(Math.random() * 100),
      cycles: Math.floor(Math.random() * 1000),
      temperature: Math.floor(Math.random() * 100),
      status: Math.floor(Math.random() * 5),
      batteryType: 1,
      capacity: Math.floor(Math.random() * 1000),
    };
  };


  function connectToBattery(id: DeviceId): void {
    log.info("BLEServiceMock: connectToBattery called", devices);
    const deviceEntry = devices.find((d) => d.device.id === id);
    if (!deviceEntry) {
      log.warn(`BLEServiceMock: connectToBattery called with unknown device ID: ${id}`);
    } else if (deviceEntry.subscription) {
      log.warn("BLEServiceMock: connectToBattery called while already connected to device ID: ", id);
    } else if (!eventBus) {
      log.warn("BLEServiceMock: connectToBattery called before eventBus is set. Unable to emit battery update events.");
    } else {
      log.info("BLEServiceMock: connectToBattery called for device ID: ", id);
      const device = deviceEntry.device;
      device.isConnected = true;
      // eventBus.next(device);
      deviceEntry.subscription = interval(2000).pipe(
        map(() => generateMockBatteryData(id)),
        map((batteryData) => new EventDefault(EventType.BatteryUpdate, batteryData))
      ).subscribe(eventBus);
    }
  }

  function disconnectFromBattery(id: DeviceId): void {
    log.info("BLEServiceMock: disconnectFromBattery called");
    const deviceEntry = devices.find((d) => d.device.id === id);
    if (deviceEntry && deviceEntry.subscription) {
      deviceEntry.device.isConnected = false;
      deviceEntry.subscription.unsubscribe();
      deviceEntry.subscription = null;
    }
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


