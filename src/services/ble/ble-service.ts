import { blelog as log } from '@/services/log/log-service';
import { Settings } from '@/services/settings/settings-service';
import { atom, Getter, Setter } from 'jotai';
import { atomFamily, atomWithLazy, atomWithRefresh, loadable } from 'jotai/utils';


import { withHistory } from 'jotai-history';
import { BleManager, Characteristic, Device, DeviceId, State, Subscription, UUID } from 'react-native-ble-plx';
import { batteryParser, isKnownBatteryCharacteristic } from './battery-service';
import { BleManagerMock } from './ble-manager-mock';
import { requestPermission } from './ble-permissions';
import { CharacteristicIdentifier, CharacteristicValueType, DeviceIdentifier, isBluetoothAvailable as isBluetoothAvailableFn, ServiceIdentifier } from './ble-types';
import { loadableWithSetter } from './jotai-util';


const LOG_SRC = "BLEService";


// subscriptions


type SubscriptionKey = [DeviceId, UUID?, UUID?];
type SubscriptionValue = Subscription | undefined;


const subscriptions = atom(new Map<string, SubscriptionValue>());

const subscription = atomFamily((key: SubscriptionKey) => {
  const keyStr = JSON.stringify(key);
  return atom(
    (get) => get(subscriptions).get(keyStr),
    (get, set, value: SubscriptionValue) => {
      const next = new Map(get(subscriptions));
      if (value === undefined || value === null) {
        next.delete(keyStr);
      } else {
        next.set(keyStr, value);
      }
      set(subscriptions, next);
    }
  );
}, (a, b) => JSON.stringify(a) === JSON.stringify(b));



// init and permissions 

const isBluetoothAvailable = atom(
  (get) => isBluetoothAvailableFn()
)


const _bleStateInternal = atom<State>(State.Unknown);

const bleState = atom(
  (get) => get(ble) ? get(_bleStateInternal) : State.Unknown
);

const bleManager = atomWithLazy<BleManager>(() => {
  const bleManager = new BleManager();
  log.debug(LOG_SRC, "BleManager created");

  return bleManager;
});

const bleManagerMock = atomWithLazy<BleManager>(() => {
  const bleManager = new BleManagerMock();
  log.debug(LOG_SRC, "Mock BleManager created");
  return bleManager;
});


const bleManagerInUse = atom<BleManager | null>(null);

/**
 * Creates an atom that lazily initializes a BleManager instance.
 * When the atom is first accessed, it will create a new BleManager instance.
 * The BleManager instance is then cached and returned on subsequent accesses.
 * @returns {atom<BleManager>} An atom that lazily initializes a BleManager instance.
 */
const bleManagerForPlatform = atom(
  (get) => {
    if (get(isBluetoothAvailable)) {
      return get(bleManager);
    } else {
      return get(bleManagerMock);
    }
  }
)

/**
 * Creates an atom that lazily initializes a BleManager instance.
 * When the atom is first accessed, it will create a new BleManager instance.
 * The BleManager instance is then cached and returned on subsequent accesses.
 */
type BleAction = 'init' | BleManager | ((prev: BleManager) => BleManager);

const ble = atom(
  (get) => get(bleManagerInUse),
  (get, set, action) => {
    if (action === 'init') {

      const LOG_PREFIX = LOG_SRC + ": init";


      const alreadyInitialized = get(bleManagerInUse) !== null;
      if (alreadyInitialized) {
        log.debug(LOG_PREFIX, ": Already initialized");
      } else {
        log.info(LOG_PREFIX, ": Initializing BleManager");

        const hasPermission = get(userPermissionToUseBluetooth);
        if (!hasPermission) {
          log.warn(LOG_PREFIX, ": Permission to use Bluetooth was not granted");
          set(Settings.snackbar, "Permission to use Bluetooth was not granted.");
        }


        const manager = get(bleManagerForPlatform);
        set(bleManagerInUse, manager);

        // subscribe to ble state changes
        manager?.onStateChange((state) => {
          log.warn(LOG_PREFIX, ": Ble state changed: ", state);
          set(_bleStateInternal, state);
          set(Settings.snackbar, "Ble state changed: " + state);
        }, true)

        // 
        if (!get(isBluetoothAvailable)) {
          set(Settings.snackbar, "Bluetooth is not available on this device. Using mock data.");
        }
      }
    }

  }
);

ble.onMount = (set) => {
  const LOG_PREFIX = LOG_SRC + ": ble.onMount";

  log.debug(LOG_PREFIX, ": init called");

  set('init');
  return () => {
    log.debug(LOG_PREFIX, ": cleanup called");
  };
};



const userPermissionToUseBluetooth = atom(
  async (get) => requestPermission()
);


// scanning

const isScanning = atom(false);

export const scanningAsync = atom(
  async (get) => get(isScanning),
  async (get, set, value: boolean) => {


    const LOG_PREFIX = LOG_SRC + ": scanningAsync";
    log.debug(LOG_PREFIX, ": scanningAsync called with value: ", value);

    set(isScanning, value);
    const manager = get(ble);
    if (value) {
      manager?.startDeviceScan(null, null, (error: Error | null, device: Device | null) => onDeviceFound(error, device, set));
    } else {
      manager?.stopDeviceScan();
    }
  }

);

const scanning = loadableWithSetter(scanningAsync);

function onDeviceFound(error: Error | null, device: Device | null, set: Setter) {
  const LOG_PREFIX = LOG_SRC + ": onDeviceFound";

  if (device) {
    log.debug(LOG_PREFIX, ": onDeviceFound called with device: ", device.id, device.name);

    // const [devices, setDevices] = useAtom(mergedDevices);
    // setDevices([device]);
    set(mergedDevices, [device]);

  } else if (error) {
    log.error(LOG_PREFIX, ": onDeviceFound called with error: ", error.message);
    set(isScanning, false);
    set(Settings.snackbar, error.message);
  } else {
    log.warn(LOG_PREFIX, ": onDeviceFound called with no device or error");
  }
}


// devices

// local cache of devices seen by onDeviceFound
const _devices = atom<Device[]>([]);

export const devices = atom(
  (get) => get(_devices),
  (get, set, value: Device[]) => {
    set(_devices, value);
  }
);

const devicesInternal = devices;

// const devices = loadable(devicesInternal);

function mergeArray<T>(left: T[], right: T[], keyExtractor: (item: T) => string): T[] {

  const all = [...left, ...right];
  const map = new Map(all.map(item => [keyExtractor(item), item]));
  const merged = Array.from(map.values());
  return merged;
}

const mergedDevices = atom(
  (get) => get(_devices),
  (get, set, newDevices: Device[]) => {

    const LOG_PREFIX = LOG_SRC + ": mergedDevices";

    const oldDevices = get(devicesInternal);
    const merged = mergeArray(oldDevices, newDevices, d => d.id);


    log.debug(LOG_PREFIX, ": mergedDevices called with: ", oldDevices.length, newDevices.length, merged.length);

    set(devices, merged);
  }
);

const deviceInternal = atomFamily(
  ({ deviceId }: { deviceId: DeviceId }) => atom(
    (get) => get(devicesInternal).find(d => d.id === deviceId),
  ),
  (a, b) => a.deviceId === b.deviceId
);

const device = atomFamily(({ deviceId }: { deviceId: DeviceId }) => loadable(deviceInternal({ deviceId })));


// const connectedDeviceRefresh = atomFamily((id: DeviceId) => atomWithRefresh(
//   async (get) => null,
// ), (a, b) => a === b);



const connectedDeviceAsync = atomFamily((id: DeviceId) => atomWithRefresh(
  async (get) => {

    // get(connectedDeviceRefresh(id));

    const LOG_PREFIX = LOG_SRC + ": connectedDeviceAsync";

    const isConnected = await get(ble)?.isDeviceConnected(id);
    if (!isConnected) {


      log.info(LOG_PREFIX, "Connecting to device: ", id);
      await get(ble)?.connectToDevice(id);
      log.info(LOG_PREFIX, "Discovering services and characteristics for device: ", id);
      return await get(ble)?.discoverAllServicesAndCharacteristicsForDevice(id);
    } else {
      log.debug(LOG_PREFIX, "Device already connected: ", id);
      const devices = await get(ble)?.connectedDevices([]);
      return devices?.find(d => d.id === id);
    }




  }
), (a, b) => a === b);

const connectedDevice = atomFamily((id: DeviceId) => loadable(connectedDeviceAsync(id)), (a, b) => a === b);

const isDeviceConnectedAsync = atomFamily((id: DeviceId) => atomWithRefresh(
  async (get) => await get(ble)?.isDeviceConnected(id),
  async (get, set, value: boolean | undefined) => {

    const LOG_PREFIX = LOG_SRC + ": isDeviceConnectedAsync setter";

    log.debug(LOG_PREFIX, ": called with id: ", id, " value: ", value);



    if (value) {
      await get(connectedDeviceAsync(id));
    } else {
      const isConnected = await get(ble)?.isDeviceConnected(id);
      if (isConnected) {
        log.info(LOG_PREFIX, "Disconnecting from device: ", id);
        await get(ble)?.cancelDeviceConnection(id);
      } else {
        log.debug(LOG_PREFIX, "Device already disconnected: ", id);
      }

    }

    set(isDeviceConnected(id));
    set(connectedDeviceAsync(id));
    // isDeviceConnectedAsync.remove(id);

  }
), (a, b) => a === b);

const isDeviceConnected = atomFamily((id: DeviceId) => loadableWithSetter(isDeviceConnectedAsync(id)), (a, b) => a === b);

const devicesWithServiceAndCharacteristicAsync = atomFamily(
  ({ serviceUUID, characteristicUUID }: { serviceUUID: UUID, characteristicUUID: UUID }) => atom(
    async (get) => {
      return get(ble)?.connectedDevices([serviceUUID]);
    }
  ),
  (a, b) => a.serviceUUID === b.serviceUUID && a.characteristicUUID === b.characteristicUUID
);

const devicesWithServiceAndCharacteristic = atomFamily(
  ({ serviceUUID, characteristicUUID }: { serviceUUID: UUID, characteristicUUID: UUID }) => loadable(devicesWithServiceAndCharacteristicAsync({ serviceUUID, characteristicUUID })),
  (a, b) => a.serviceUUID === b.serviceUUID && a.characteristicUUID === b.characteristicUUID
);

// services

const servicesAsync = atomFamily((id: DeviceId) => atom(
  async (get) => {
    await get(connectedDeviceAsync(id));
    return await get(ble)?.servicesForDevice(id);
  }
))
const services = atomFamily((id: DeviceId) => loadable(servicesAsync(id)), (a, b) => a === b);

const serviceAsync = atomFamily(
  ({ deviceId, serviceUUID }: ServiceIdentifier) => atom(
    async (get) => {
      const s = await get(servicesAsync(deviceId));
      return s?.find(s => s.uuid === serviceUUID);
    }
  ),
  serviceIdentifierEquals
);

const service = atomFamily(
  (params: ServiceIdentifier) => loadable(serviceAsync(params)),
  serviceIdentifierEquals
);

// characteristics
const characteristicsAsync = atomFamily(
  ({ deviceId, serviceUUID }: ServiceIdentifier) => atomWithRefresh(
    async (get) => {
      await get(connectedDeviceAsync(deviceId));
      return await get(ble)!.characteristicsForDevice(deviceId, serviceUUID)
    }
  ),
  serviceIdentifierEquals
)


const characteristics = atomFamily(
  (params: ServiceIdentifier) => loadable(characteristicsAsync(params)),
  // serviceIdentifierEquals
  serviceIdentifierEquals
)


function deviceIdentifierEquals(a: DeviceIdentifier, b: DeviceIdentifier): boolean {
  return a.deviceId === b.deviceId;
}

function serviceIdentifierEquals(a: ServiceIdentifier, b: ServiceIdentifier): boolean {
  return a.deviceId === b.deviceId && a.serviceUUID === b.serviceUUID;
}

function characteristicIdentifierEquals(a: CharacteristicIdentifier, b: CharacteristicIdentifier): boolean {
  return a.deviceId === b.deviceId && a.serviceUUID === b.serviceUUID && a.characteristicUUID === b.characteristicUUID;
}


export const deviceHasServiceAndCharacteristicAsync = atomFamily(
  ({ deviceId, serviceUUID, characteristicUUID }: CharacteristicIdentifier) => atom(
    async (get) => {
      const characteristics = await get(characteristicsAsync({ deviceId, serviceUUID }));
      return characteristics.some(c => c.uuid === characteristicUUID);
    }
  ),
  characteristicIdentifierEquals
);

const deviceHasServiceAndCharacteristic = atomFamily(
  (params: CharacteristicIdentifier) => loadable(deviceHasServiceAndCharacteristicAsync(params)),
  characteristicIdentifierEquals
);


const characteristicAsync = atomFamily(({ deviceId, serviceUUID, characteristicUUID }: CharacteristicIdentifier) => atomWithRefresh(
  async (get) => {
    await get(connectedDeviceAsync(deviceId));
    const manager = get(ble);
    const characteristics = await manager?.characteristicsForDevice(deviceId, serviceUUID);
    return characteristics?.find(c => c.uuid === characteristicUUID);
  }
  // ,
  // async (get, set, value: Characteristic) => {
  //   await get(connectedDeviceAsync(deviceId));
  //   const manager = get(ble);
  //   // TODO: is this the correct api to write an entire characteristic object
  //   await manager?.writeCharacteristicWithoutResponseForDevice(deviceId, serviceUUID, characteristicUUID, value.value || "");
  // }
), characteristicIdentifierEquals);


const characteristic = atomFamily(
  (params: CharacteristicIdentifier) => loadableWithSetter(characteristicAsync(params)),
  characteristicIdentifierEquals
);


// descriptors

const descriptorsAsync = atomFamily(
  ({ deviceId, serviceUUID, characteristicUUID }: CharacteristicIdentifier) => atom(
    async (get) => {
      await get(connectedDeviceAsync(deviceId));
      return await get(ble)?.descriptorsForDevice(deviceId, serviceUUID, characteristicUUID);
    }
  ),
  characteristicIdentifierEquals
);

const descriptors = atomFamily(
  (params: CharacteristicIdentifier) => loadable(descriptorsAsync(params)),
  characteristicIdentifierEquals
);

// characteristic value

const CHARACTERISTIC_VALUE_HISTORY_LIMIT = 50;

/**
 * One primitive value atom per characteristic identifier.
 * (Name kept as characteristicValueBase to match your existing API surface.)
 */
const characteristicValueBase = atomFamily(
  (cid: CharacteristicIdentifier) => atom<CharacteristicValueType>(null),
  characteristicIdentifierEquals
);

/**
 * One history atom per characteristic identifier.
 * This is the key fix: wrap characteristicValueBase(cid), not a global map atom.
 */
export const characteristicValueHistory = atomFamily(
  (cid: CharacteristicIdentifier) =>
    withHistory(characteristicValueBase(cid), CHARACTERISTIC_VALUE_HISTORY_LIMIT),
  characteristicIdentifierEquals
);

/**
 * Convenience atom for reading/writing current value.
 * Writing through the history atom preserves undo/redo stack.
 */
export const characteristicValue = atomFamily(
  (cid: CharacteristicIdentifier) =>
    atom(
      (get) => get(characteristicValueBase(cid)),
      (get, set, value: CharacteristicValueType) => {
        set(characteristicValueHistory(cid), value);
      }
    ),
  characteristicIdentifierEquals
);

async function onCharacteristicUpdate(error: Error | null, characteristic: Characteristic | null, get: Getter, set: Setter) {

  const LOG_PREFIX = LOG_SRC + ": onCharacteristicUpdate";

  if (error) {
    const msg = error.message;
    if (msg.includes("Operation was cancelled")) {
      log.warn(LOG_PREFIX, "Operation was cancelled", msg);
    } else {
      log.error(LOG_PREFIX, ": onCharacteristicUpdate called with error: ", error.message);
      set(Settings.snackbar, error.message);
    }
  } else if (characteristic) {



    const cid = { deviceId: characteristic.deviceID, serviceUUID: characteristic.serviceUUID, characteristicUUID: characteristic.uuid };

    log.debug(LOG_PREFIX, "uuid, value, isNotifying", characteristic.deviceID, characteristic.serviceUUID, characteristic.uuid, characteristic.value, characteristic.isNotifying ? "notifying" : "not notifying");

    set(characteristicValue(cid), characteristic.value);
    set(characteristicAsync(cid));

    if(isKnownBatteryCharacteristic(cid)) {
      log.debug(LOG_PREFIX, ": Received update for known battery characteristic, pumping battery parser");
      set(batteryParser(characteristic.deviceID));
    }


  } else {
    log.warn(LOG_PREFIX, ": onCharacteristicUpdate called without error or characteristic");
  }

}

export const characteristicIsNotifyingAsync = atomFamily(
  (cid: CharacteristicIdentifier) => atomWithRefresh(
    async (get) => {
      // await get(connectedDeviceAsync(deviceId));
      const c = await get(characteristicAsync(cid));
      return c ? c.isNotifying : false;
    },
    async (get, set, value: boolean) => {
      if (value) {
        // start notifications
        await get(characteristicAsync(cid));
        try {
          const sub = await get(ble)?.monitorCharacteristicForDevice(cid.deviceId, cid.serviceUUID, cid.characteristicUUID, (error, characteristic) => onCharacteristicUpdate(error, characteristic, get, set));
          set(subscription([cid.deviceId, cid.serviceUUID, cid.characteristicUUID]), sub as Subscription);
        } catch (error) {
          log.error(LOG_SRC + ": characteristicIsNotifyingAsync setter", "Failed to start monitoring characteristic: ", error);
          set(Settings.snackbar, "Failed to start monitoring characteristic: " + error);
        }

      } else {
        // stop notifications
        const sub = get(subscription([cid.deviceId, cid.serviceUUID, cid.characteristicUUID]));
        sub?.remove();
        set(subscription([cid.deviceId, cid.serviceUUID, cid.characteristicUUID]), undefined);
      }

      set(characteristicAsync(cid));
    }
  ),
  characteristicIdentifierEquals
);

const characteristicIsNotifying = atomFamily(
  (params: CharacteristicIdentifier) => loadableWithSetter(characteristicIsNotifyingAsync(params)),
  characteristicIdentifierEquals
)



export const Bluetooth = {
  isBluetoothAvailable,
  bleState,
  devices,
  device,
  isDeviceConnected,
  connectedDevice,
  scanning,
  services,
  service,
  characteristics,
  characteristic,
  characteristicValue,
  descriptors,
  subscription,
  characteristicIsNotifying,
  devicesWithServiceAndCharacteristic
}
