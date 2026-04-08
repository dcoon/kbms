// import { BatteryData } from "./BatteryData";
// import { SmartPowerUtil } from "./SmartPowerUtil";

import { filter, from, map, mergeMap, OperatorFunction, pipe, scan } from 'rxjs';



export const KV_MESSAGE_LENGTH_MAXIMUM = 121;
export const KV_MESSAGE_LENGTH_MINIMUM = 38;
export const KV_MESSAGE_HEAD = 176;
export const KV_MESSAGE_TAIL = 82;

export class BatteryData {
    deviceId?: string;
    batteryType?: number;
    status?: number;
    infoStatus?: number;
    afeStatus?: number;
    voltage: number = 0;
    current: number = 0;
    capacity: number = 0;
    soc: number = 0;
    cycles: number = 0;
    temperature: number = 0;

    static isBatteryData(obj: any): obj is BatteryData {
        return obj && typeof obj === 'object' && 'deviceId' in obj && 'current' in obj && 'voltage' in obj;
    }
}


function dumpBatteryEntity(b: BatteryData) {
    console.log(b);
}


function Asciitochar(b: number, b2: number): number {
    let i: number;
    let i2 = ((b < 48 || b > 57) ? (b < 65 || b > 70) ? 0 : (b - 65) + 10 : b - 48) << 4;
    if (b2 >= 48 && b2 <= 57) {
        i = b2 - 48;
    } else {
        if (b2 < 65 || b2 > 70) {
            return i2 + 0;
        }
        i = (b2 - 65) + 10;
    }
    return i2 + i;
}


/**
 * Extract the message content from the given base64 encoded string.
 *
 * The message content is extracted by finding the head and tail of the message
 * and returning the content as a Buffer.
 *
 * @param {string} msg - The base64 encoded string containing the message content.
 * @returns {Buffer} - The extracted message content as a Buffer.
 * 
 * @deprecated 
 */
export function extractMessageBase64(msg: string): Buffer {
    const buffer = Buffer.from(msg, 'base64');
    return extractMessage(buffer);
}


/**
 * Extract the message content from the given buffer.
 *
 * The message content is extracted by finding the head and tail of the message
 * (defined by KV_MESSAGE_HEAD and KV_MESSAGE_TAIL), and then slicing the buffer
 * to obtain the content.
 *
 * @param {Buffer} buffer - the buffer containing the message to be extracted
 * @returns {Buffer} - the extracted message content
 * 
 * @deprecated
 */
export function extractMessage(buffer: Buffer): Buffer {

    const KV_MESSAGE_HEAD = 176;
    const KV_MESSAGE_TAIL = 82;

    /*
    1. convert base64 to buffer
    2. find start and end of message (head and tail)
    3. calculate checksum and compare with expected checksum
    4. if valid, extract the message content and log it
    */

    const head = buffer.findIndex((byte) => byte === KV_MESSAGE_HEAD);
    const tail = buffer.findIndex((byte) => byte === KV_MESSAGE_TAIL);
    const message = buffer.slice(head + 1, tail + 1);
    // console.log(head, tail, message.toString('hex'), buffer.toString('hex'));
    // const str = message.toString();
    return message;

}
function decode64(bytes: Buffer): number {
    // let iAsciitochar = (((((Asciitochar(bytes[6], bytes[7]) << 8) + Asciitochar(bytes[4], bytes[5])) << 8) + Asciitochar(bytes[2], bytes[3])) << 8) + Asciitochar(bytes[0], bytes[1]);
    const b1 = Asciitochar(bytes[0], bytes[1]);
    const b2 = Asciitochar(bytes[2], bytes[3]);
    const b3 = Asciitochar(bytes[4], bytes[5]);
    const b4 = Asciitochar(bytes[6], bytes[7]);
    // console.log("b1", b1, "b2", b2, "b3", b3, "b4", b4);
    return (b4 << 24) + (b3 << 16) + (b2 << 8) + b1;
}
function decode32(bytes: Buffer): number {
    const b1 = Asciitochar(bytes[0], bytes[1]);
    const b2 = Asciitochar(bytes[2], bytes[3]);
    // console.log("b1", b1);
    return (b2 << 8) + b1;
}
function decode16(bytes: Buffer): number {
    const b1 = Asciitochar(bytes[0], bytes[1]);
    // console.log("b1", b1);
    return b1;
}
const LONG = 8;
const INT = 4;
const SHORT = 2;
function decode(bytes: Buffer, s: number[]): number {
    const [offset, numBytes] = s;
    if (numBytes === INT) {
        return decode32(bytes.slice(offset, offset + INT));
    } else if (numBytes === SHORT) {
        return decode16(bytes.slice(offset, offset + SHORT));
    } else if (numBytes === LONG) {
        return decode64(bytes.slice(offset, offset + LONG));
    } else {
        throw new Error(`Unsupported number of bytes: ${numBytes}`);
    }
}

/**
 * Decodes a message from a string and updates the battery entity with the decoded information.
 * @param {string} msg - the message to decode
 * @param {BatteryData} battery - the battery entity to update
 * @returns {boolean} whether the message was successfully decoded and the battery entity updated
 */
export function decodeMessageFromString(msg: string, battery: BatteryData): boolean {
    const buffer = Buffer.from(msg);
    return decodeMessage(buffer, battery);
}

export function decodeMessageToBatteryData(buffer: Buffer): BatteryData | null {
    const battery = new BatteryData();
    const success = decodeMessage(buffer, battery);
    return success ? battery : null;
}

/**
 * Decodes a message from a given Buffer and updates the battery entity with the decoded information.
 * 
 * The message is expected to have a minimum length of 38 bytes.
 * 
 * The decoded information includes the voltage, current, capacity, SOc, cycles, status, and temperature.
 * 
 * If the capacity differs from the old capacity by more than 10000, the old capacity is updated.
 * 
 * @param {Buffer} buffer - the buffer containing the message to be decoded
 * @param {BatteryData} battery - the battery entity to update
 * @returns {boolean} whether the message was successfully decoded and the battery entity updated
 */
export function decodeMessage(buffer: Buffer, battery: BatteryData): boolean {

    const KV_MESSAGE_LENGTH_MINIMUM = 38;

    const KV_MESSAGE_VOLTAGE = [0, LONG]; // 1
    const KV_MESSAGE_CURRENT = [8, LONG]; // 2
    const KV_MESSAGE_CAPACITY = [16, LONG]; // 3 
    const KV_MESSAGE_CYCLES = [24, INT]; // 4
    const KV_MESSAGE_SOC = [28, INT]; // 5
    const KV_MESSAGE_TEMPERATURE = [32, INT]; // 6
    const KV_MESSAGE_STATUS = [36, INT]; // 7
    const KV_MESSAGE_AFE_STATUS = [40, SHORT];


    if (buffer.length >= KV_MESSAGE_LENGTH_MINIMUM) {
        battery.voltage = decode(buffer, KV_MESSAGE_VOLTAGE);
        battery.current = decode(buffer, KV_MESSAGE_CURRENT);
        // Not 100% sure what oldCapacity is used for
        // let iAsciitochar3 = (((((Asciitochar(bytes[22], bytes[23]) << 8) + Asciitochar(bytes[20], bytes[21])) << 8) + Asciitochar(bytes[18], bytes[19])) << 8) + Asciitochar(bytes[16], bytes[17]);
        // if (BatteryData.getmCapacityOld1() <= 0 || Math.abs(iAsciitochar3 - BatteryData.getmCapacityOld1()) < 10000) {
        const capacity = decode(buffer, KV_MESSAGE_CAPACITY);
        // const oldCapacity = battery.getmCapacityOld1();
        // const capacityDelta = Math.abs(capacity - oldCapacity) < 10000;
        // console.log("Capacity:", capacity, "Old Capacity:", oldCapacity, "Capacity Delta:", capacityDelta);
        // if (oldCapacity <= 0 || capacityDelta) {
        battery.capacity = capacity;
        // }
        battery.soc = decode(buffer, KV_MESSAGE_SOC);
        battery.cycles = decode(buffer, KV_MESSAGE_CYCLES);
        battery.status = decode(buffer, KV_MESSAGE_STATUS);
        battery.temperature = decode(buffer, KV_MESSAGE_TEMPERATURE);
        // battery.setMsg(buffer.toString());
        battery.batteryType = buffer.length;
        return true;
    }

    return false;
}



export const transformCharValueStreamToBatteryDataPipeline: OperatorFunction<string, BatteryData | null> = pipe(

        map((message) => Buffer.from(message, 'base64')), // convert the base64 string to a Buffer
        mergeMap((message) => from(message)),   // convert the Buffer to a stream of bytes
        scan((acc, c) => {
            if (c === 176) return [176]; // KV_MESSAGE_HEAD
            if (c === 82) return acc[acc.length - 1] === 82 ? [] : [...acc, 82]; // KV_MESSAGE_TAIL
            if (acc.length > KV_MESSAGE_LENGTH_MAXIMUM) return [];
            return [...acc, c];
        }, [] as number[]),
        filter((acc) => acc[0] === 176 && acc[acc.length - 1] === 82), // KV_MESSAGE_HEAD and KV_MESSAGE_TAIL,
        map((msg) => decodeMessageToBatteryData(Buffer.from(msg).slice(1, msg.length - 1))),
);
