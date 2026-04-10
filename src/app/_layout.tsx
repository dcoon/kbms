import { Provider as JotaiProvider, useAtom } from 'jotai';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Snackbar } from '@/components/ui/snackbar';
import { uilog as log } from '@/services/log/log-service';
import { Settings } from '@/services/settings/settings-service';
import { PaperTheme } from '@/util/paper-theme';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

const LOG_SRC = "AppLayout";

function AppContent() {
  const LOG_PREFIX = LOG_SRC + ": AppContent";
  const [logLevel] = useAtom(Settings.logLevel);
  log.info(LOG_PREFIX, "Initializing app with log level: ", logLevel);

  return (
    <PaperProvider theme={PaperTheme}>
      <Snackbar />
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
          <NativeTabs.Trigger.Icon sf="gear" md="settings" />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </PaperProvider>
  );
}

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <JotaiProvider>
          <AppContent />
      </JotaiProvider>
    </SafeAreaProvider>
  );
}
