import log from '@/services/log/log-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { atom } from 'jotai';
import { atomFamily, atomWithStorage, createJSONStorage, unwrap } from 'jotai/utils';
import { Platform } from 'react-native';
import { DeviceId } from 'react-native-ble-plx';

const LOG_SRC = "SettingsService";



export enum LogLevel  {
  error = 'error',
  warning = 'warn',
  info = 'info',
  debug = 'debug',
}

export const LogLevelOptions = [
{label: 'Error', value: LogLevel.error},
{label: 'Warning', value: LogLevel.warning},
{label: 'Info', value: LogLevel.info},
{label: 'Debug', value: LogLevel.debug},
];

export type Favorite = {
  id: DeviceId;
  name: string;
}

const memoryStorage = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {},
  removeItem: (_key: string) => {},
};

const settingsStorage = createJSONStorage<any>(() => {
  if (Platform.OS === 'web') {
    const localStorage = (globalThis as any).localStorage;
    return localStorage ?? memoryStorage;
  }

  return AsyncStorage;
});

const favoritesInStorage = atomWithStorage<Favorite[]>('favorites', [], settingsStorage, { getOnInit: true });
const favorites = unwrap(favoritesInStorage, (prev) => prev ?? []);

const favorite = atomFamily((value: Favorite) => atom(
  (get) => get(favorites).some(fav => fav.id === value?.id) ? true : false,
  (get, set, value: Favorite) => {

  

    const isFavorite = get(favorites).some(fav => fav.id === value.id)
    const newFavorites = isFavorite ? get(favorites).filter(fav => fav.id !== value.id) : [...get(favorites), value];
    log.debug(LOG_SRC, ": favorite: ", value, isFavorite, newFavorites);
    set(favorites, newFavorites);
    
  }
));


const notificationsEnabledInStorage = atomWithStorage<boolean>('notificationsEnabled', true, settingsStorage, { getOnInit: true });
const notificationsEnabled = unwrap(notificationsEnabledInStorage, (prev) => prev ?? true);

const sendLogsToServerInStorage = atomWithStorage<boolean>('sendLogsToServer', true, settingsStorage, { getOnInit: true });
const sendLogsToServer = unwrap(sendLogsToServerInStorage, (prev) => prev ?? true);

const logLevelInStorageBase = atomWithStorage<LogLevel>('logLevel', LogLevel.error, settingsStorage, { getOnInit: true });
const logLevelInStorage = unwrap(logLevelInStorageBase, (prev) => prev ?? LogLevel.error);

const logLevel = atom(
  (get) => {
    const stored = get(logLevelInStorage);
    // Sync external logger state on read if it's different
    if (log.getSeverity() !== stored) {
      log.setSeverity(stored);
    }
    return stored;
  },
  (get, set, value: LogLevel) => {
    set(logLevelInStorage, value);
    log.setSeverity(value);
  }
);

const developerModeInStorage = atomWithStorage<boolean>('developerMode', false, settingsStorage, { getOnInit: true });
const developerMode = unwrap(developerModeInStorage, (prev) => prev ?? false);

const _snackbarMessages = atom<string[]>([]);

const MAX_SNACKBAR_MESSAGES = 4;

// peekMessage, pushMessage(msg: string)
const snackbar = atom(
  // peek first message
  (get) => get(_snackbarMessages)[0],
  // push last message
  (get, set, value: string) => {
    // push message
    const msgs = get(_snackbarMessages)
    const newMsgs = msgs.length >= MAX_SNACKBAR_MESSAGES  ? [...msgs.slice(MAX_SNACKBAR_MESSAGES - 1), value] : [...msgs, value];
    set(_snackbarMessages, newMsgs);
  }
);

const shiftSnackbar = atom(
  null,
  (get, set) => {
    const msgs = get(_snackbarMessages);
    set(_snackbarMessages, msgs.slice(1));
  }
);




// Pending cross-tab device navigation (workaround for NativeTabs Android stack reset)
const pendingNavigateDevice = atom<DeviceId | null>(null);

export const Settings = {
  favorites,
  favorite,
  notificationsEnabled,
  sendLogsToServer,
  logLevel,
  snackbar,
  shiftSnackbar,
  developerMode,
  pendingNavigateDevice,
};