import { BleProvider } from '@/components/ble-provider';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NativeTabs } from 'expo-router/unstable-native-tabs';


export default function TabLayout() {

  return (
    <BleProvider>
      <SafeAreaProvider>
        <PaperProvider>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="devices">
          <NativeTabs.Trigger.Label>Devices</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="house.fill" md="home"/>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="gear" md="settings"/>
        </NativeTabs.Trigger>
      </NativeTabs>
    </PaperProvider>
    </SafeAreaProvider>
    </BleProvider>
  );
}
