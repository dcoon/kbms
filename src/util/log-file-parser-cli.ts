import { command, run } from 'cmd-ts';
import { extractDeviceAndValueUpdatesCommand } from './log-file-parser';

const cmd = command({
  name: 'kbms-cli',
  description: 'Log parser for KBMS',
  version: '1.0.0',
  args: {
    // number: positional({ type: number, displayName: 'num' }),
    // message: option({
    //   long: 'greeting',
    //   type: string,
    // }),
  },
  handler: (args) => {
    // args.message; // string
    // args.number; // number
    // console.log(args);

    extractDeviceAndValueUpdatesCommand();
  },
});

run(cmd, process.argv.slice(2));