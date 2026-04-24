

// Value and record types

export type UUID = string;
export type Value = string;


export type LogRecord = {
    deviceId: UUID;
    value: Value;
    timestamp?: string;
};

export type SeenLogRecord = LogRecord & {
    firstSeen: string;
    lastSeen: string;
};

export type LogRecordOrString = LogRecord | string;
export type ByteArray = Uint8Array;


//

export type StageFunctionType<Input, Output> = (source: AsyncIterable<Input>) => AsyncIterable<Output>;


type StringToStringType = StageFunctionType<string, string>;
type StringToLogRecordType = StageFunctionType<string, LogRecord>;
type LogRecordToLogRecordType = StageFunctionType<LogRecord, LogRecord>;
type LogRecordToStringType = StageFunctionType<LogRecord, string>;
type StringToByteArrayType = StageFunctionType<string, ByteArray>;

export type InputStageType = StringToLogRecordType;
export type FilterStageType = LogRecordToLogRecordType;
export type FieldStageType = LogRecordToLogRecordType | LogRecordToStringType;
export type OutputStageType = LogRecordToStringType | StringToByteArrayType;


export async function* upperCase(source: AsyncIterable<Buffer>) {
    for await (const chunk of source) {
        yield chunk.toString().toUpperCase();
    }
}
// Generators


// Inputs
export async function* extractDeviceAndValues(source: AsyncIterable<string>): AsyncIterable<LogRecord> {
    const bleRegex = /characteristic:\s+([A-Fa-f0-9-]{36})\s+value:\s+([A-Za-z0-9+/=]+)/;

    for await (const line of source) {
        const match = bleRegex.exec(line);

        if (match) {
            const deviceId = match[1];
            const value = match[2];

            if (!deviceId || !value) {
                continue;
            }

            yield { deviceId, value };
        }
        // Lines that don't match are simply ignored (filtered out)
    }
}

export async function* splitByLines(source: AsyncIterable<Buffer | string>): AsyncGenerator<string> {
    let buffer = '';

    for await (const chunk of source) {
        buffer += chunk.toString('utf8');

        // Split by either \r\n (Windows) or \n (Unix)
        const lines = buffer.split(/\r?\n/);

        // Save the last partial line for the next chunk
        buffer = lines.pop() ?? '';

        for (const line of lines) {
            yield line;
        }
    }

    if (buffer) yield buffer;
}

// 4:04:46 PM | BLE | DEBUG : BLEService: onDeviceFound : onDeviceFound called with device:  92785590-343D-FAC4-9561-1C3AA9294122 SmartSolar HQ20273D7CN
export async function* extractOnDeviceFound(source: AsyncIterable<string>): AsyncIterable<LogRecord> {
    const bleRegex = /^([^|]+?)\s*\|.*?device:\s+([A-Fa-f0-9-]{36})\s+(.+)$/;

    for await (const line of source) {
        const match = bleRegex.exec(line);

        if (match) {
            const timestamp = match[1]?.trim();
            const deviceId = match[2];
            const value = match[3];

            if (!timestamp || !deviceId || !value) {
                continue;
            }

            yield {
                timestamp: timestamp,
                deviceId: deviceId,
                value: value
            };
        }
        // Lines that don't match are simply ignored (filtered out)
    }
}



// Filters
export async function* filterByDeviceId(source: AsyncIterable<LogRecordOrString>, targetDeviceId: string): AsyncGenerator<LogRecordOrString> {
    for await (const update of source) {
        if (typeof update === 'object') {
            if (update.deviceId === targetDeviceId) {
                yield update;
            }
        } else if (typeof update === 'string' && update.includes(targetDeviceId)) {
            yield update;
        }
    }
}

function toSortableTimestamp(timestamp: string): number | null {
    const normalized = timestamp.replace(/[\u202F\u00A0]/g, ' ').trim();

    const parsedDate = Date.parse(normalized);
    if (!Number.isNaN(parsedDate)) {
        return parsedDate;
    }

    const twelveHourMatch = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])$/.exec(normalized);

    if (twelveHourMatch) {
        const hours = Number(twelveHourMatch[1]);
        const minutes = Number(twelveHourMatch[2]);
        const seconds = Number(twelveHourMatch[3] ?? '0');
        const amPm = twelveHourMatch[4].toUpperCase();

        const hour24 = amPm === 'PM' ? (hours % 12) + 12 : (hours % 12);
        return hour24 * 3600 + minutes * 60 + seconds;
    }

    const twentyFourHourMatch = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(normalized);
    if (twentyFourHourMatch) {
        const hours = Number(twentyFourHourMatch[1]);
        const minutes = Number(twentyFourHourMatch[2]);
        const seconds = Number(twentyFourHourMatch[3] ?? '0');
        return hours * 3600 + minutes * 60 + seconds;
    }

    return null;
}

function compareTimestampValues(aTimestamp: string, bTimestamp: string, aOrder: number, bOrder: number): number {
    const aSortable = toSortableTimestamp(aTimestamp);
    const bSortable = toSortableTimestamp(bTimestamp);

    if (aSortable !== null && bSortable !== null) {
        if (aSortable !== bSortable) {
            return aSortable - bSortable;
        }
    } else if (aSortable !== null) {
        return -1;
    } else if (bSortable !== null) {
        return 1;
    }

    if (aTimestamp !== bTimestamp) {
        return aTimestamp.localeCompare(bTimestamp);
    }

    return aOrder - bOrder;
}

export async function* uniqueByDeviceWithSeenRange(source: AsyncIterable<LogRecord>): AsyncGenerator<SeenLogRecord> {
    type SeenAccumulator = SeenLogRecord & {
        firstSeenOrder: number;
        lastSeenOrder: number;
    };

    const byDevice = new Map<string, SeenAccumulator>();
    let order = 0;

    for await (const record of source) {
        order += 1;

        if (!record.timestamp) {
            continue;
        }

        const existing = byDevice.get(record.deviceId);

        if (!existing) {
            byDevice.set(record.deviceId, {
                ...record,
                firstSeen: record.timestamp,
                lastSeen: record.timestamp,
                firstSeenOrder: order,
                lastSeenOrder: order,
            });
            continue;
        }

        const firstCompare = compareTimestampValues(record.timestamp, existing.firstSeen, order, existing.firstSeenOrder);
        if (firstCompare < 0) {
            existing.firstSeen = record.timestamp;
            existing.firstSeenOrder = order;
        }

        const lastCompare = compareTimestampValues(record.timestamp, existing.lastSeen, order, existing.lastSeenOrder);
        if (lastCompare >= 0) {
            existing.lastSeen = record.timestamp;
            existing.lastSeenOrder = order;
            existing.value = record.value;
            existing.timestamp = record.timestamp;
        }
    }

    const sorted = [...byDevice.values()].sort((a, b) => {
        const firstSeenCompare = compareTimestampValues(a.firstSeen, b.firstSeen, a.firstSeenOrder, b.firstSeenOrder);
        if (firstSeenCompare !== 0) {
            return firstSeenCompare;
        }

        return a.deviceId.localeCompare(b.deviceId);
    });

    for (const record of sorted) {
        const { firstSeenOrder: _firstSeenOrder, lastSeenOrder: _lastSeenOrder, ...output } = record;
        yield output;
    }
}


// Field extractors
export async function* valuesOnly(source: AsyncIterable<LogRecord>): AsyncGenerator<Value> {
    for await (const update of source) {
        if (typeof update === 'object') {
            yield update.value;
        }
    }
}

export async function* noop(source: AsyncIterable<any>): AsyncGenerator<any> {
    for await (const update of source) {
        yield update;
    }
}

export async function* devicesOnly(source: AsyncIterable<LogRecord>): AsyncGenerator<UUID> {
    const seen = new Set<string>();

    for await (const update of source) {
        if (typeof update === 'object') {
            if (seen.has(update.deviceId)) {
                continue;
            }

            seen.add(update.deviceId);
            yield update.deviceId;
        }
    }
}


// Output formatters
export async function* jsonFormat(source: AsyncIterable<LogRecordOrString>): AsyncGenerator<string> {
    for await (const update of source) {
        yield JSON.stringify(update) + '\n';
    }
}

function toCsvCell(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    const text = String(value);
    if (/[",\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
}


export async function* csvFormat(source: AsyncIterable<LogRecord>): AsyncGenerator<string> {
    const records: Record<string, unknown>[] = [];
    const keys: string[] = [];
    const seenKeys = new Set<string>();

    for await (const update of source) {
        const record = update as Record<string, unknown>;
        records.push(record);

        for (const key of Object.keys(record)) {
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                keys.push(key);
            }
        }
    }

    if (keys.length === 0) {
        return;
    }

    yield `${keys.join(',')}\n`;

    for (const record of records) {
        const row = keys.map((key) => toCsvCell(record[key])).join(',');
        yield `${row}\n`;
    }
}

export async function* typescriptFormat(source: AsyncIterable<LogRecord>): AsyncGenerator<string> {
    yield 'export const data = [\n'; // TypeScript array start
    for await (const update of source) {
        yield `  { deviceId: "${update.deviceId}", value: "${update.value}" },\n`;
    }
    yield '];\n'; // TypeScript array end
}

export async function* base64ToUint8(source: AsyncIterable<string>): AsyncGenerator<ByteArray> {
    const values: string[] = [];

    for await (const value of source) {
        values.push(value);
    }

    if (values.length > 0) {
        const chunks = values
            .filter((value) => value.length > 0)
            .map((value) => Buffer.from(value, 'base64'));
        const buffer = new Uint8Array(Buffer.concat(chunks));

        if (buffer) {
            yield buffer;
        }
    }
}


// async function* parseBatteryDataFromValues(source: AsyncIterable<string>) {
//     const values: string[] = [];

//     for await (const value of source) {
//         values.push(value);
//     }

//     if (values.length > 0) {
//         const bytes = base64ArrayToByteArray(values);
//         const parser = new BatteryDataParser();
//         const batteryData = parser.parse(bytes);

//         if (batteryData) {
//             yield batteryData;
//         }
//     }
// }





