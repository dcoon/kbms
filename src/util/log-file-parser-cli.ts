import { TEST_CHARACTERISTIC_VALUES } from '@/services/manufacturers/kilovault/battery-data-test-data';
import { command, option, optional, run, string } from 'cmd-ts';
import { pipeline } from 'stream/promises';
import { base64ToUint8, csvFormat, extractDeviceAndValues, extractOnDeviceFound, jsonFormat, splitByLines, typescriptFormat, uniqueByDeviceWithSeenRange, valuesOnly } from './log-file-parser';


enum OutputFormat {
  // Json = 'json',
  // Csv = 'csv',
  // Text = 'text',
  Uint8Array = 'uint8array',
  TypeScript = 'typescript',
}

enum Field {
  Device = 'device',
  Value = 'value',
  Name = 'name',
}

type StageFn<TIn = unknown, TOut = unknown> =
  (source: AsyncIterable<TIn>) => AsyncIterable<TOut>;

type AnyStage = StageFn<any, any>;
const TEST_DEVICE_ID = 'TEST_DEVICE';


const cmd = command({
  name: 'kbms-cli',
  description: 'Log parser for KBMS',
  version: '1.0.0',
  args: {
    // number: positional({ type: number, displayName: 'num' }),
    input: option({
      long: 'input',
      short: 'i',
      description: 'Input file path (defaults to stdin). Use "-" to explicitly specify stdin.',
      type: optional(string),
    }),
    format: option({
      long: 'format',
      short: 'f',
      description: 'Output format: json, csv, typescript, or uint8array.',
      type: optional(string),
    }),
    device: option({
      long: 'device',
      short: 'd',
      description: 'Filter by device ID. Use "all" or omit to include every device.',
      type: optional(string),
    }),
    field: option({
      long: 'field',
      short: 'F',
      description: 'Field(s) to extract: device, value. Use "all" or omit to include every field.',
      type: optional(string),
    }),
    sort: option({
      long: 'sort',
      short: 's',
      description: 'Sort output by field: device or value.',
      type: optional(string),
    }),
  },
  handler: (args) => {
    // args.message; // string
    // args.number; // number



    let input: AsyncIterable<Buffer | string> = process.stdin;
    let stages: AnyStage[] = [];
    let output: NodeJS.WritableStream = process.stdout;


    switch (args.input) {
      case undefined:
      case '-':
        stages.push(splitByLines);

        break;
      case 'test':
        input = (async function* () {
          yield* TEST_CHARACTERISTIC_VALUES;
        })();
        stages.push(async function* (source: AsyncIterable<string>) {
          for await (const value of source) {
            yield { deviceId: TEST_DEVICE_ID, value: value };
          }
        });
        break;
      default:
        const fileStreamStage = async function* () {
          const fs = await import('fs');
          const stream = fs.createReadStream(args.input!, { encoding: 'utf-8' });
          yield* stream;
        };
        stages.push(fileStreamStage);
        stages.push(splitByLines);

        break;
    }

        // stages.push(extractDeviceAndValues);


    // switch (args.device) {
    //   case 'all':
    //   case undefined:
    //     break; // No filtering
    //   default:
    //     const targetDeviceId = args.device;
    //     const filter = async function* (source: AsyncIterable<LogRecord>) {
    //       yield* filterByDeviceId(source, targetDeviceId);
    //     };
    //     stages.push(filter);
    //     break;
    // }


    // query 
    switch (args.field) {
      case undefined:
        break; // No field extraction
      case 'device':
        stages.push(extractOnDeviceFound);
        break;
      case 'value':
        stages.push(extractDeviceAndValues);
        stages.push(valuesOnly);
        break;
      default:
        console.warn(`Unknown field "${args.field}", defaulting to all fields`);
    }

    // sort 
    switch (args.sort) {
    case undefined:
      break; // No sorting
    case 'device':
      stages.push(uniqueByDeviceWithSeenRange);
      break;
    // case 'value':
    //   stages.push(uniqueByValue);
    //   break;
    default:
      console.warn(`Unknown sort field "${args.sort}", no sorting will be applied`);
    }


    // output format
    switch (args.format) {
      case undefined:
        stages.push(jsonFormat);
        break;
      case 'uint8array':
        // const uint8ArrayStage = async function* (source: AsyncIterable<LogRecord>) {
        //   yield* base64ToUint8(valuesOnly(source));
        // };
        stages.push(valuesOnly);
        stages.push(base64ToUint8);
        break;


      case 'typescript':
        stages.push(typescriptFormat);
        break;
      case 'json':
        stages.push(jsonFormat);
        break;
      case 'csv':
        stages.push(csvFormat);
        break;
      default:
        console.warn(`Unknown format "${args.format}", defaulting to JSON`);
        stages.push(jsonFormat);
    }

    extractValuesFromLog({ input, output, transforms: stages });
  },
});


// commands

interface ExtractValuesFromLogsArgs {
  input?: AsyncIterable<unknown>;
  output?: NodeJS.WritableStream;
  transforms?: StageFn[];
}

async function extractValuesFromLog({ input = process.stdin, output = process.stdout, transforms = [] }: ExtractValuesFromLogsArgs): Promise<void> {

  try {
    await pipeline(
      input,
      ...transforms,
      output
    );
  } catch (err) {
    console.error('Pipeline encountered an error:', err);
  }

}

run(cmd, process.argv.slice(2));