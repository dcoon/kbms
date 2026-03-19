import {
  consoleTransport,
  logger
} from "react-native-logs";

const BLE = "BLE";
const UI = "UI";
const UTIL = "UTIL";

// Create a logger instance with the console transport and custom options. 
// https://www.npmjs.com/package/react-native-logs

export const log = logger.createLogger({
  transport:  consoleTransport,
  enabledExtensions: [UI, BLE, UTIL],
  severity: "debug",
  transportOptions: {
    colors: {
      info: "blueBright",
      warn: "yellowBright",
      error: "redBright",
    }
    }
});

export const uilog = log.extend(UI);
export const blelog = log.extend(BLE);
export const utillog = log.extend(UTIL);

export default log;