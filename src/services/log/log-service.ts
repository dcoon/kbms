import {
  fileAsyncTransport,
  logger,
  mapConsoleTransport
} from "react-native-logs";

import { Alert } from 'react-native';


import * as FileSystem from 'expo-file-system/legacy';

export const LOG_DIR = FileSystem.cacheDirectory || "";
export const LOG_FILE_PREFIX = "kbms_logs";
export const LOG_FILE_EXTENSION = "txt";

if(LOG_DIR === "") {
  console.warn("LogService: No valid directory for log files. File logging will be disabled.");
  Alert.alert("LogService: No valid directory for log files. File logging will be disabled.");

}

const transport = LOG_DIR !== "" ? [mapConsoleTransport, fileAsyncTransport] : [mapConsoleTransport];

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
    fileName: `${LOG_FILE_PREFIX}_{date-today}.${LOG_FILE_EXTENSION}`, // Creates a new file daily
    filePath: LOG_DIR, // Standard Expo storage path
    fileNameDateType: "iso", // Formats date as YYYY-MM-DD
    }
});


export const uilog = log.extend(UI);
export const blelog = log.extend(BLE);
export const utillog = log.extend(UTIL);

export default log;

utillog.info("LogService: Logger initialized ", log.getSeverity(), LOG_DIR, transport.length);
