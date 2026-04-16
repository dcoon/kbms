
import { loadableWithSetter } from "@/services/ble/jotai-util";
import { atom } from "jotai";
import { atomFamily, loadable } from "jotai/utils";
import { DeviceId } from "react-native-ble-plx";

import { BatteryData, BatteryIdentifier } from "@/services/ble/battery";
import { characteristicIsNotifyingAsync, characteristicValueHistory, deviceHasServiceAndCharacteristicAsync } from "@/services/ble/ble-service";
import { KV_BATTERY_NOTIFY_UUID, KV_BATTERY_SERVICE_UUID } from "@/services/manufacturers/kilovault/battery-data-types";
import { RESET } from "jotai-history";
import log from "../log/log-service";
import { BatteryDataParser } from "../manufacturers/kilovault/BatteryDataParser";
import { CharacteristicIdentifier } from "./ble-types";

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

// battery data raw byte streams


export const batteryParser = atomFamily((id: BatteryIdentifier) => atom(
    (get) => {
    },
    (get, set) => {

        const LOG_PREFIX = `${LOG_SRC} - batteryParser: `;
        
        const cid = { deviceId: id as DeviceId, serviceUUID: KV_BATTERY_SERVICE_UUID, characteristicUUID: KV_BATTERY_NOTIFY_UUID };
        const [current, ...history] = get(characteristicValueHistory(cid));
        const chunks = [current, ...history].reverse();

        log.debug(LOG_PREFIX, "Found chunks: ", cid.deviceId, chunks.length);

        const parser = new BatteryDataParser();
        const data = parser.parseBase64Array(chunks);
        if (data) {
            log.info(`${LOG_PREFIX} Parsed battery data for device ${id}}`);
            set(battery(id), data);
        }

        const consumed = parser.consumed;
        if (consumed > 0) {
            log.debug(`${LOG_PREFIX} Consumed ${consumed} battery data chunks for device ${id}`);
            set(characteristicValueHistory(cid), RESET);
        }



    }
), batteryIdentifierEquals);

export const isKnownBatteryType = atomFamily((id: DeviceId) => loadable(deviceHasServiceAndCharacteristicAsync({ deviceId: id, serviceUUID: KV_BATTERY_SERVICE_UUID, characteristicUUID: KV_BATTERY_NOTIFY_UUID })), (a, b) => a === b);

export function isKnownBatteryCharacteristic(cid: CharacteristicIdentifier): boolean {
    return cid.serviceUUID === KV_BATTERY_SERVICE_UUID && cid.characteristicUUID === KV_BATTERY_NOTIFY_UUID;
}

const isBatteryConnectedAsync = atomFamily((id: DeviceId) => atom(
    async (get) => {

        return await get(characteristicIsNotifyingAsync({ deviceId: id, serviceUUID: KV_BATTERY_SERVICE_UUID, characteristicUUID: KV_BATTERY_NOTIFY_UUID }));
    },
    async (get, set, value: boolean) => {
        set(characteristicIsNotifyingAsync({ deviceId: id, serviceUUID: KV_BATTERY_SERVICE_UUID, characteristicUUID: KV_BATTERY_NOTIFY_UUID }), value);
    }
), batteryIdentifierEquals);

// const isBatteryConnected = atomFamily((id: DeviceId) => loadable(isBatteryConnectedAsync(id)), (a, b) => a === b);

export const isBatteryConnected = atomFamily(
    (id: DeviceId) => loadableWithSetter(isBatteryConnectedAsync(id)),
    batteryIdentifierEquals
);


