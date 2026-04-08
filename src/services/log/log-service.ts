import {
  fileAsyncTransport,
  logger,
  mapConsoleTransport
} from "react-native-logs";

import * as FileSystem from 'expo-file-system/legacy';

const logDir =  FileSystem.cacheDirectory || "";

if(logDir === "") {
  console.warn("LogService: No valid directory for log files. File logging will be disabled.");
}

const transport = logDir !== "" ? [mapConsoleTransport, fileAsyncTransport] : [mapConsoleTransport];

const BLE = "BLE";
const UI = "UI";
const UTIL = "UTIL";

export const log = logger.createLogger({
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  transport:  transport,
  enabledExtensions: [UI, BLE, UTIL],
  severity: "info",
  transportOptions: {
    mapLevels: {
      debug: "log",
      info: "info",
      warn: "warn",
      error: "error",
    },
    FS: FileSystem,
    fileName: `blex_logs_{date-today}.txt`, // Creates a new file daily
    filePath: logDir, // Standard Expo storage path
    fileNameDateType: "iso", // Formats date as YYYY-MM-DD
    }
});


export const uilog = log.extend(UI);
export const blelog = log.extend(BLE);
export const utillog = log.extend(UTIL);

export default log;

utillog.info("LogService: Logger initialized ", log.getSeverity(), logDir);
