import { utillog as log } from '@/services/log';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { EventDefault, EventType, useEventBusContext } from './event-bus-provider';


/*
 * Example:
* @SettingData label="Test Settings" description="Settings for tests"
* class TestSettings {
    * @Setting label="Foo" description="A test setting" icon="settings"
*     public foo: string = "bar";

    * @settingGroup label="Logging" description="Logging settings"
    logging = {
        level: "info"
    } 
* }
* 
* const settings = useSettings<TestSettings>(TestSettings);
* settings.i18n = new Provider();
* settings.storage = new Provider();
* settings.logger = new Provider();
* 
* settings.load();
* settings.save();
* settings.onChange = () => {};
* settings.foo = bar;
* 
* 
* return <SettingsComponent settings={settings} />
* 
* <SettingsProvider<TestSettings> settings={settings} storage={storageProvider} logger={loggerProvider} i18n={i18nProvider}>
* </SettingsProvider>
*     
 */



//   private async dumpStoredSettings() {
//   const allKeys = await AsyncStorage.getAllKeys();
//   const allValues = await AsyncStorage.multiGet(allKeys);
//   log.debug("dumpStoredSettings: ", allValues);
// }


//
// StorageProvider
//

interface StorageProvider<T> {
  save(key?: string, value?: any, settings?: T): Promise<void>;
  load(key?: string, settings?: T): Promise<string | T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class ReactNativeAsyncStorageProvider<T> implements StorageProvider<T> {
  async clear(): Promise<void> {
    log.debug("Clearing settings");
    await AsyncStorage.clear();
  }
  async save(key?: string, value?: any, settings?: T): Promise<void> {
    // log.debug("save: ", key, value);
     if (key) {
      log.debug("save: ", key, value);
      await AsyncStorage.setItem(key, JSON.stringify(value));

     } else if (settings) {
      this.saveAll(settings);
    
    } else {
      log.warn("No key or value provided for saving setting");
    }
  }

  async remove(key: string): Promise<void> {
    log.debug("Removing setting: ", key);
    await AsyncStorage.removeItem(key);
  }


  objectDelta(oldObj: any, newObj: any): any {
    const delta: any = {};
    for (const [key, value] of Object.entries(newObj)) {
      if (oldObj[key] !== value) {
        delta[key] = value;
      }
    }
    return delta;
  }

  async saveAll(settings: T): Promise<void> {
    const oldSettings = {} as T;
    await this.loadAll(oldSettings);
    const newSettings = this.objectDelta(oldSettings, settings);
    log.debug("saveAll. Old: ", oldSettings, "New: ", newSettings);
    await AsyncStorage.multiSet(Object.entries(newSettings).map(([key, value]) => [key, JSON.stringify(value)]));

  }


  async load(key?: string, settings?: T): Promise<string | T | null> {

    if (key !== undefined) {
      const value = await AsyncStorage.getItem(key);
      const json = value ? JSON.parse(value) : null;
      if (settings && json) {
        log.debug("load setting: ", key, json);
        Object.assign(settings as any, { [key]: json });
      }
      return json as string;

    } else if (settings !== undefined) {
      return await this.loadAll(settings);
    } else {
      log.warn("No key provided for loading setting");
    }

    return null;

  }

  async loadAll(settings: T): Promise<T | null> {

    const allKeys = await AsyncStorage.getAllKeys();
    const allValues = await AsyncStorage.multiGet(allKeys);
    log.debug("loadAll: all stored values: ", allValues);
    for (const [key, value] of allValues) {
      if (key && value) {
        Object.assign(settings as any, { key: JSON.parse(value) });
      }
    }

    return settings;

  }


}

// 
// Decorators
// 

export type SettingOptions = {
  label: string;
  description?: string;
  icon?: string;
}

// // @deprecated
// export function PropertySetting<T>(options: SettingOptions) {
//   log.debug("property setting deorator: ", options);
//   return function (target: T, propertyKey: string) {
//     log.debug("settingsProperty: ", target, propertyKey, options);
//   };
// }

export function Setting(options: SettingOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalSet = descriptor.set;
    descriptor.set = function (value: any) {
      log.debug(`decorated setting:", property: ${propertyKey}, value: ${value}, options: `, options);
      // storageProvider?.save(propertyKey, value, this);
      originalSet?.call(this, value);
      onSettingsChanged && onSettingsChanged(propertyKey, value);
    }

  };
}

// Globals
let SettingsContext: React.Context<any> | null = null;
let storageProvider: StorageProvider<any> | null = null;

export function useSettingsContext<T>(): T {
  const context = SettingsContext as React.Context<T>;
  return useContext<T>(context);
}

type onSettingsChangedCallback<T> = (key?: string, value?: any, settings?: T) => void;
let onSettingsChanged: onSettingsChangedCallback<any> | null = null;

// SettingsProvider

interface SettingsProviderProps<T> {
  data: T;
  storage?: StorageProvider<T>;
  children: React.ReactNode;
}

export function SettingsProvider<T>({ children, data, storage }: SettingsProviderProps<T>) {



  SettingsContext = createContext<T>(data);
  
  storageProvider = storage || new ReactNativeAsyncStorageProvider<T>();
  // const proto = Object.getPrototypeOf(data);
  // proto.onSettingsChanged = onSettingsChanged

  const eventBus = useEventBusContext();
  const [settings, setSettings] = useState<T>(data);


  onSettingsChanged = (key?: string, value?: any, settingsParam?: T) => {
    // const updatedSettings = cloneWithDecorators(settingsParam || settings);
    log.debug("onSettingsChanged: ", key, value, settingsParam);

    if (key !== undefined) {
      if (value !== undefined) {
        storageProvider?.save(key, value, settingsParam);
      } else {
        storageProvider?.remove(key);
      }
    } else if (settingsParam) {
      storageProvider?.save(undefined, undefined, settingsParam);
    }

    const event = new EventDefault(EventType.SettingsChanged, [key, value, settingsParam]);
    
    eventBus?.next(event);
  

    //setSettings(updatedSettings);

  }


  // function cloneWithDecorators(source: T): T {
  //   // 1. Create a new object with the same prototype
  //   const target = Object.create(Object.getPrototypeOf(source));

  //   // 2. Get all descriptors (including accessors) from the source
  //   const descriptors = Object.getOwnPropertyDescriptors(source);

  //   // 3. Define properties on the target using these descriptors
  //   Object.defineProperties(target, descriptors);

  //   return target;
  // }


  const loadSettings = useEffect(() => {
    const load = async () => {
      const loadedSettings = await storageProvider?.load(undefined, settings);
      // log.debug("Loaded settings from storage: ", loadedSettings);
      if (loadedSettings && onSettingsChanged) {
        onSettingsChanged(undefined, undefined, loadedSettings);
      }
    };
    load();
  }, [ storageProvider ]);




  // const loadSettings = useEffect(() => {
  //   const loadSettings = async () => {
  //     const wrapper = settings as SettingsWrapper;
  //     await wrapper.loadAll(settings);
  //     log.debug("Loaded stored settings:", settings);
  //     onSettingsChanged(undefined, undefined, wrapper as Settings);

  //   };
  //   loadSettings();
  // }, []);



  return (
    <SettingsContext.Provider value={settings} >
      {children}
    </SettingsContext.Provider>
  );

}
