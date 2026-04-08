import { BleProvider } from '@/components/ble-provider';
import { ReactNativeAsyncStorageProvider, SettingsProvider } from '@/components/settings-provider';
import React from 'react';
import { PaperProvider, useTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Event, EventBusProvider, useEventBusContext } from '@/components/event-bus-provider';
import { UserSettings } from '@/constants/user-settings';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Subject } from 'rxjs';


export default function App() {

  return (
    <EventBusProvider eventBus={new Subject<Event>()}>

      <SettingsProvider<UserSettings> data={new UserSettings()} storage={new ReactNativeAsyncStorageProvider<UserSettings>()}>
        <TabLayout />
      </SettingsProvider>
    </EventBusProvider>

  );
}

function TabLayout() {
  const theme = useTheme();
  theme.dark = true;

  const eventBus = useEventBusContext();

  return (
    <BleProvider eventBus={eventBus}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NativeTabs>
            <NativeTabs.Trigger name="index">
              <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
              <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="devices">
              <NativeTabs.Trigger.Label>Devices</NativeTabs.Trigger.Label>
              <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="settings">
              <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
              <NativeTabs.Trigger.Icon sf="gear" md="settings" />
            </NativeTabs.Trigger>
          </NativeTabs>
        </PaperProvider>
      </SafeAreaProvider>
    </BleProvider>
  );
}
