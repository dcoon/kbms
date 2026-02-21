import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../constants/paper-theme';

export default function AppLayout() {
  return (
    <PaperProvider theme={theme}>
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
  );
}
