import { BatteryData, BatteryDataBase } from "@/services/ble/battery";
import { CharacteristicValueType } from '@/services/ble/ble-types';
import log from "@/services/log/log-service";
import base64 from "react-native-base64";


export type ByteArray = Uint8Array;
export type BatteryDataChunk = CharacteristicValueType;
export type BatteryDataChunkArray = BatteryDataChunk[];


const START_BYTE = 0xB0; // in decimal: 176
const END_BYTE = 0x52; // in decimal: 82    

const MIN_PACKET_SIZE = 114;

const LOG_SRC = 'BatteryDataParser';


enum Endianess {
    Little,
    Big
}


export function base64ArrayToByteArray(batteryDataArray: BatteryDataChunkArray): ByteArray {

    const arr = batteryDataArray.map(d => base64.decode(d ? d : '').split('').map(c => c.charCodeAt(0)));
    const buffer = new Uint8Array(arr.flat());
    return buffer;

}

export class BatteryDataParser {

    private head: number = 0;
    private data: ByteArray | undefined = undefined;

    consumed: number = 0;

    parseBase64Array(batteryDataArray: BatteryDataChunkArray): BatteryData | undefined {
        const buffer = base64ArrayToByteArray(batteryDataArray);
        return this.parse(buffer);
    }

    parse(buffer: ByteArray): BatteryData | undefined {

        const LOG_PREFIX = `${LOG_SRC} - parse: `;

        this.head = 0;

        log.debug(`${LOG_PREFIX} Starting parse, buffer length: ${buffer.length}, head: ${this.head}, buffer: ${buffer.slice(0, 10)}`);

        const begin = buffer.indexOf(START_BYTE);
        if (begin === -1) {
            log.debug(`${LOG_PREFIX} Start byte not found in buffer`);
            return undefined;
        } else {
            log.debug(`${LOG_PREFIX} Start byte found at position ${begin}`);
        }

        const end = buffer.indexOf(END_BYTE, begin + 1);
        if (end === -1) {
            log.debug(`${LOG_PREFIX} End byte not found in buffer`);
            return undefined;
        } else  {
            log.debug(`${LOG_PREFIX} End byte found at position ${end}`);
        }

        this.data = buffer.subarray(begin, end+1);
        const size = this.data.length;

        if (size < MIN_PACKET_SIZE) {
            // this.head = end + 1;
            this.consumed = end + 1;
            log.info(`${LOG_PREFIX} Packet too small (size: ${size}), skipping`);
            return undefined;
        }

        this.head = 0;


        // battery data format from ImHex:
        // le u8 start;
        // le u64 voltage[[format("format_u64")]];
        // le u64 current[[format("format_u64")]];
        // le u64 capacity[[format("format_u64")]];
        // le u32 cycles[[format("format_u32")]];
        // le u32 soc[[format("format_u32")]];
        // le u32 temp[[format("format_u32")]];
        // le u32 status[[format("format_u32")]];
        // le u16 afe[[format("format_u16")]];
        // le u16 unknown;
        // le u32 cell1[[format("format_u32")]];
        // le u32 cell2[[format("format_u32")]];
        // le u32 cell3[[format("format_u32")]];
        // le u32 cell4[[format("format_u32")]];
        // le u8 unused[];
        // be u32 checksum;
        // le u8 end;


        log.debug(`${LOG_PREFIX} Parsing packet of size ${size} bytes`);

        const magic = this.uint8();
        const voltage = this.uint64();
        const current = this.uint64();
        const capacity = this.uint64();
        const cycles = this.uint32();
        const soc = this.uint32();
        const temperature = this.uint32();
        const status = this.uint32();
        const afe = this.uint16();
        const unknown = this.uint16();
        const cell1 = this.uint32();
        const cell2 = this.uint32();
        const cell3 = this.uint32();
        const cell4 = this.uint32();

        this.head = this.data.length - 5; // skip unused bytes

        
        const checksum = this.uint32(Endianess.Big);

        // const checksumTail = this.data.slice(this.data.length - 5, this.data.length);
        // const checksumTailHex = Array.from(checksumTail)
        //     .map((byte) => byte.toString(16).toUpperCase().padStart(2, '0'))
        //     .join(' ');
        // log.info(LOG_PREFIX, "Checksum (read, raw): ", checksum, `0x${checksumTailHex}`);

        this.consumed = end;

        const calculatedChecksum = this.calculateChecksum(this.data.subarray(1, this.data.length - 5)); // calculate checksum on all bytes between start and checksum (exclusive)

        if (checksum !== calculatedChecksum) {
            log.warn(`${LOG_PREFIX} Checksum mismatch: expected ${checksum}, calculated ${calculatedChecksum}, size: ${size}`);
            return undefined;
        } 




        const battery = new BatteryDataBase();
        battery.deviceId = "";
        battery.voltage = voltage;
        battery.current = current;
        battery.capacity = capacity;
        battery.soc = soc;
        battery.cycles = cycles;
        battery.temperature = temperature;
        battery.lastUpdated = new Date();
        battery.cells = [
            { voltage: cell1 },
            { voltage: cell2 },
            { voltage: cell3 },
            { voltage: cell4 },
        ];


        log.info(`${LOG_PREFIX} Successfully parsed battery data: voltage=${voltage}, current=${current}, capacity=${capacity}, soc=${soc}, cycles=${cycles}, temperature=${temperature}`);

        return battery;


    }

    calculateChecksum(data: ByteArray): number {
        let checksum = 0;
        for (let i = 0; i < data.length - 2; i += 2) {
            checksum += this._uint16(data.subarray(i), Endianess.Big);
        }
        return checksum & 0xFFFFFFFF; // ensure it's a 32-bit unsigned integer
    }

    consume(n: number): ByteArray {
        const a = this.data?.subarray(this.head, this.head + n);
        this.head += n;
        return a!;
    }


    uint8(): number {
        return this._uint8(this.consume(1));
    }

    uint16(): number {
        return this._uint16(this.consume(2));
    }

    uint32(endianess: Endianess = Endianess.Little): number {
        return this._uint32(this.consume(4), endianess);
    }

    uint64(): number {
        return this._uint64(this.consume(8));
    }

    _uint8(data: ByteArray, endianess: Endianess = Endianess.Big): number {


        const A = 65;
        const F = 70;
        const ZERO = 48;
        const NINE = 57;

        if (data.length === 0) {
            throw new Error("Data array is empty");
        }

        const c = data[0];

        if (c >= ZERO && c <= NINE) {
            return c - ZERO;
        } else if (c >= A && c <= F) {
            return c - A + 10;
        } else {
            return 0;
        }

    };

    _uint16(data: ByteArray, endianess: Endianess = Endianess.Big): number {

        // const b1 = uint8(value);
        // const b2 = uint8(value >> 8);

        // return (uint8(b1 >> 8) << 4) + b2;
        const b1 = this._uint8(data.subarray(0, 1), endianess);
        const b2 = this._uint8(data.subarray(1, 2), endianess);

        if (endianess === Endianess.Little) {
            return (b2 << 4) + b1;
        } else {
            return (b1 << 4) + b2;
        }

        //return (b1 << 4) + b2;
    };


    _uint32(data: ByteArray, endianess: Endianess = Endianess.Big): number {

        const s1 = this._uint16(data.subarray(0, 2));
        const s2 = this._uint16(data.subarray(2, 4));

        //return std::format("{:04X}:{:02X}:{:02X}:{:04X}", s1, s2, s3, s4);
        if (endianess === Endianess.Little) {
            return (s2 << 8) + s1;
        } else {
            return (s1 << 8) + s2;
        }
    };


    _uint64(data: ByteArray, endianess: Endianess = Endianess.Big): number {

        const s1 = this._uint16(data.subarray(0, 2));
        const s2 = this._uint16(data.subarray(2, 4));
        const s3 = this._uint16(data.subarray(4, 6));
        const s4 = this._uint16(data.subarray(6, 8));

        return (s4 << 24) + (s3 << 16) + (s2 << 8) + s1;
    };


}   