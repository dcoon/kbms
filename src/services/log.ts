import {
    consoleTransport,
    logger
} from "react-native-logs";

const BLE = "BLE";
const UI = "UI";

export const log = logger.createLogger({
  transport:  consoleTransport,
  enabledExtensions: [UI, BLE],
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

export default log;