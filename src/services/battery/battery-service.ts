
import { loadableWithSetter } from "@/services/ble/jotai-util";
import { appStore } from "@/services/state/jotai-store";
import { atom } from "jotai";
import { atomFamily, loadable } from "jotai/utils";
import { DeviceId } from "react-native-ble-plx";

import { BatteryData, BatteryIdentifier } from "@/services/battery/battery";
import { CharacteristicIdentifier } from "@/services/ble/ble";
import { characteristicIsNotifyingAsync, characteristicValueHistory, characteristicValueLastUpdate, deviceHasServiceAndCharacteristicAsync } from "@/services/ble/ble-service";
import { KV_BATTERY_NOTIFY_UUID, KV_BATTERY_SERVICE_UUID } from "@/services/manufacturers/kilovault/battery-data-types";
import log from "../log/log-service";
import { base64ArrayToByteArray, BatteryDataParser } from "../manufacturers/kilovault/BatteryDataParser";

// battery
const LOG_SRC = "BatteryService";

function batteryIdentifierEquals(a: BatteryIdentifier, b: BatteryIdentifier): boolean {
    return a === b;
}

// battery data
const batteryBase = atomFamily((id: BatteryIdentifier) => atom<BatteryData >(), 
batteryIdentifierEquals);


export const battery = atomFamily((id: BatteryIdentifier) => atom(
    (get) => {
        return get(batteryBase(id));
    },
    (get, set, value: BatteryData) => {
        set(batteryBase(id), value);
    }
), batteryIdentifierEquals);


export const batteries = atomFamily((ids: BatteryIdentifier[]) => atom(
    (get) => {
        return ids.map(id => get(battery(id)));
    }
), (a, b) => a.length === b.length && a.every((id, index) => batteryIdentifierEquals(id, b[index])));


export const batteryParser = atomFamily((id: BatteryIdentifier) => atom(
    (get) => {
    },
    (get, set) => {

        const LOG_PREFIX = `${LOG_SRC} - batteryParser: `;
        
        const cid = { deviceId: id as DeviceId, serviceUUID: KV_BATTERY_SERVICE_UUID, characteristicUUID: KV_BATTERY_NOTIFY_UUID };
        const [current, ...history] = get(characteristicValueHistory(cid));
        const chunks = history.reverse();
        const parser = new BatteryDataParser();
        const buffer = base64ArrayToByteArray(chunks);

        log.debug(LOG_PREFIX, "Parsing buffer: ", cid.deviceId, chunks[0]);

        const batteryData = parser.parse(buffer);
        if (batteryData) {
            log.debug(`${LOG_PREFIX} Parsed battery data for device ${id}}`);
            set(battery(id), batteryData);
        }

        const consumed = parser.consumed;
        if (consumed > 0) {
            log.debug(`${LOG_PREFIX} Consumed ${consumed} battery data chunks for device ${id}`);
            // set(characteristicValueHistory(cid), RESET);
        }



    }
), batteryIdentifierEquals);

export const isKnownBatteryType = atomFamily((id: DeviceId) => loadable(deviceHasServiceAndCharacteristicAsync({ deviceId: id, serviceUUID: KV_BATTERY_SERVICE_UUID, characteristicUUID: KV_BATTERY_NOTIFY_UUID })), (a, b) => a === b);

export function isKnownBatteryCharacteristic(cid: CharacteristicIdentifier): boolean {
    return cid.serviceUUID === KV_BATTERY_SERVICE_UUID && cid.characteristicUUID === KV_BATTERY_NOTIFY_UUID;
}

const globalBatterySubscriptionKey = "__kbmsBatteryCharacteristicSubscription__";

if (!(globalThis as Record<string, unknown>)[globalBatterySubscriptionKey]) {
    const unsubscribe = appStore.sub(characteristicValueLastUpdate, () => {
        const update = appStore.get(characteristicValueLastUpdate);
        if (!update || update.value === null) {
            return;
        }

        if (isKnownBatteryCharacteristic(update.cid)) {
            appStore.set(batteryParser(update.cid.deviceId));
        }
    });

    (globalThis as Record<string, unknown>)[globalBatterySubscriptionKey] = unsubscribe;
}

const isBatteryConnectedAsync = atomFamily((id: DeviceId) => atom(
    async (get) => {

        return await get(characteristicIsNotifyingAsync({ deviceId: id, serviceUUID: KV_BATTERY_SERVICE_UUID, characteristicUUID: KV_BATTERY_NOTIFY_UUID }));
    },
    async (get, set, value: boolean) => {
        const isNotifying = await get(characteristicIsNotifyingAsync({ deviceId: id, serviceUUID: KV_BATTERY_SERVICE_UUID, characteristicUUID: KV_BATTERY_NOTIFY_UUID }));
        if(isNotifying !== value) {
            set(characteristicIsNotifyingAsync({ deviceId: id, serviceUUID: KV_BATTERY_SERVICE_UUID, characteristicUUID: KV_BATTERY_NOTIFY_UUID }), value);
        }
    }
), batteryIdentifierEquals);

// const isBatteryConnected = atomFamily((id: DeviceId) => loadable(isBatteryConnectedAsync(id)), (a, b) => a === b);

export const isBatteryConnected = atomFamily(
    (id: DeviceId) => loadableWithSetter(isBatteryConnectedAsync(id)),
    batteryIdentifierEquals
);


