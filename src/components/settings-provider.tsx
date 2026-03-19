import { DeviceId } from '@/services/ble-service';
import { utillog as log, log as mainlog } from '@/services/log';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';


export type LogLevel = 'none' | 'error' | 'warning' | 'info' | 'debug';

export type SettingsKey = string;
export type SettingsValue = any;

export type CallbackFunction = (key?: SettingsKey, value?: SettingsValue) => void;

export interface Settings {
  notificationsEnabled: boolean;
  logLevel: LogLevel;
  sendLogsToServer: boolean;
  runInBackground?: boolean;
  favorites: DeviceId[];
  clear: boolean;

}

class DefaultSettings implements Settings {

  notificationsEnabled: boolean = false;
  logLevel: LogLevel = "error";
  sendLogsToServer: boolean = true;
  runInBackground?: boolean | undefined = false;
  favorites: DeviceId[] = [];
  clear: boolean = false;

}

class SettingsWrapper implements Settings {

  private _settings: Settings;
  private onSettingsChanged: CallbackFunction;
  private _saveOnChange: boolean = true;

  constructor(onSettingsChanged: CallbackFunction, settings?: Settings, wrapper?: SettingsWrapper) {

    if (wrapper) {
      this._settings = wrapper._settings;
    } else if (settings) {
      this._settings = settings;
    } else {
      this._settings = new DefaultSettings();
    }

    this.onSettingsChanged = onSettingsChanged;
  }


  set settings(value: Settings) {
    this._settings = value;
  }

  set clear(value: boolean) {
    if (value) {
      AsyncStorage.clear();
      this.settings = new DefaultSettings();
      log.debug("Cleared all settings from storage");
      this.onSettingsChanged('clear', true);
    }

  }

  // notificationsEnabled: boolean = false;
  get notificationsEnabled() {
    return this._settings.notificationsEnabled;
  }

  set notificationsEnabled(value: boolean) {
    this.setSetting('notificationsEnabled', value);
  }


  get logLevel() {
    return this._settings.logLevel;
  }

  set logLevel(value: LogLevel) {
    mainlog.setSeverity(value);
    this.setSetting('logLevel', value);
  }


  private setSetting(key: string, value: any, save: boolean = true, notify: boolean = true) {
    log.debug("Setting {key: ", key, ", value: ", value, "}");
    Object.assign(this._settings, { [key]: value });
    if (this._saveOnChange) {
      this.save(key, value);
      this.onSettingsChanged(key, value);

    }
  }

  get sendLogsToServer() {
    return this._settings.sendLogsToServer;
  }

  set sendLogsToServer(value: boolean) {
    this.setSetting('sendLogsToServer', value);
  }

  get runInBackground() {
    return this._settings.runInBackground;
  }

  set runInBackground(value: boolean | undefined) {
    this.setSetting('runInBackground', value);
  }

  get favorites() {
    return this._settings.favorites;
  }
  set favorites(value: DeviceId[]) {
    this.setSetting('favorites', value);
  }

  private save(key: SettingsKey, value: SettingsValue) {
    AsyncStorage.setItem(key, JSON.stringify(value));

    log.debug(`save: ${key} = ${value}`);
    this.dumpStoredSettings();
  }


  async loadAll(settings: Settings) {


    log.debug("loadAll: Loading settings from storage...", settings);
    const allKeys = await AsyncStorage.getAllKeys();
    const allValues = await AsyncStorage.multiGet(allKeys);
    // log.debug("loadAll: allValues: ", allValues);
    try {
      this._saveOnChange = false;
      for (const pair of allValues) {
        const key = pair[0];
        const value = pair[1];
        // log.debug("loadAll: ", key, value, typeof value);

        if (value !== undefined && value !== null && value !== "undefined") {
          // Object.assign(settings, { [key]: JSON.parse(value) });
          this.setSetting(key, JSON.parse(value), false, false);
        }
      }
    } finally {
      this._saveOnChange = true;
    }

    this.onSettingsChanged();


  }



  private async dumpStoredSettings() {
    const allKeys = await AsyncStorage.getAllKeys();
    const allValues = await AsyncStorage.multiGet(allKeys);
    log.debug("dumpStoredSettings: ", allValues);
  }





};




const SettingsContext = createContext<Settings | null>(null);

export const useSettingsContext = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {



  const onSettingsChanged = (key?: SettingsKey, value?: SettingsValue) => {
    log.debug(`onSettingsChanged: ${key} = ${value}`);
    //const updatedSettings = { ...settings, [key]: value };

    setSettings(new SettingsWrapper(onSettingsChanged, settings));
  }

  const [settings, setSettings] = useState<Settings>(new SettingsWrapper(onSettingsChanged));


  useEffect(() => {
    const loadSettings = async () => {
      const wrapper = settings as SettingsWrapper;
      await wrapper.loadAll(settings);
      log.debug("Loading stored settings:", settings);

    };
    loadSettings();
  }, []);



  return (
    <SettingsContext.Provider value={settings ? settings : null} >
      {children}
    </SettingsContext.Provider>
  );
};