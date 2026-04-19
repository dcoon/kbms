import { pipeline } from 'node:stream/promises';

interface FooCommandFlags {
    // ...
}

export async function extractDeviceAndValueUpdatesCommand(): Promise<void> {

    // 2:40:32 PM | BLE | INFO : BLEService: onCharacteristicUpdate Received update for characteristic:  40CE22B5-64FD-E2C4-49ED-2ECEF7AA2FD2  value:  MDAwMDAwMDAwMDAwMDAwMA== 

      try {
    await pipeline(
      process.stdin,
      splitByLines,   // From previous step: yields strings
      extractDeviceAndValues, // This step: yields { uuid, value } objects
      valuesOnly,
      base64ToUint8,
    //   parseBatteryDataFromValues,
    // async function* (batteries: AsyncIterable<BatteryData>) {
    //     for await (const battery of batteries) {
    //       // Format for output
    //                 yield `${battery.deviceId}, ${battery.voltage}\n`;
    //     }
    //   },
      process.stdout
    );
  } catch (err) {
    console.error('Pipeline encountered an error:', err);
  }
}




async function* upperCase(source: AsyncIterable<Buffer>) {
    for await (const chunk of source) {
        yield chunk.toString().toUpperCase();
    }
}
// Generators



async function* extractDeviceAndValues(lines: AsyncIterable<string>) {
    const bleRegex = /characteristic:\s+([A-Fa-f0-9-]{36})\s+value:\s+([A-Za-z0-9+/=]+)/;

    for await (const line of lines) {
        const match = bleRegex.exec(line);

        if (match) {
            const uuid = match[1];
            const value = match[2];

            if (!uuid || !value) {
                continue;
            }

            yield { uuid, value };
        }
        // Lines that don't match are simply ignored (filtered out)
    }
}

async function* filterByUuid(source: AsyncIterable<{ uuid: string; value: string }>, targetUuid: string) {
    for await (const update of source) {
        if (update.uuid === targetUuid) {
            yield update;
        }
    }
}

async function* valuesOnly(source: AsyncIterable<{ uuid: string; value: string }>) {
    for await (const update of source) {
        yield update.value;
    }
}


async function* base64ToUint8(source: AsyncIterable<string>) {
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



async function* splitByLines(source: AsyncIterable<Buffer | string>): AsyncGenerator<string> {
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
