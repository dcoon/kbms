import log from '@/services/log/log-service';
import { atom } from 'jotai';
import { atomFamily, atomWithStorage } from 'jotai/utils';
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


const favorites = atomWithStorage('favorites', [] as Favorite[], undefined, { getOnInit: true });

const favorite = atomFamily((value: Favorite) => atom(
  (get) => get(favorites).some(fav => fav.id === value?.id) ? true : false,
  (get, set, value: Favorite) => {

  

    const isFavorite = get(favorites).some(fav => fav.id === value.id)
    const newFavorites = isFavorite ? get(favorites).filter(fav => fav.id !== value.id) : [...get(favorites), value];
    log.debug(LOG_SRC, ": favorite: ", value, isFavorite, newFavorites);
    set(favorites, newFavorites);
    
  }
));


const notificationsEnabled = atomWithStorage('notificationsEnabled', true);
const sendLogsToServer = atomWithStorage('sendLogsToServer', true);

const logLevelInStorage = atomWithStorage<LogLevel>('logLevel', LogLevel.error);

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

const developerMode = atomWithStorage('developerMode',  false);

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




export const Settings = {
  favorites,
  favorite,
  notificationsEnabled,
  sendLogsToServer,
  logLevel,
  snackbar,
  shiftSnackbar,
  developerMode
};