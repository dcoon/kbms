import { Provider as JotaiProvider, useAtom } from 'jotai';
import React, { useMemo } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Snackbar } from '@/components/ui/snackbar';
import { useColorScheme } from '@/hooks/use-color-scheme.web';
import { uilog as log } from '@/services/log/log-service';
import { Settings } from '@/services/settings/settings-service';
import { appStore } from '@/services/state/jotai-store';
import { adjustThemeForScreenSize, DefaultTheme } from '@/theme/theme';
import { Stack } from 'expo-router';
import { useWindowDimensions } from 'react-native';

const LOG_SRC = "AppLayout";

function AppContent() {
  const LOG_PREFIX = LOG_SRC + ": AppContent";
  const [logLevel] = useAtom(Settings.logLevel);
  log.info(LOG_PREFIX, "Initializing app with log level: ", logLevel);

  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();

  const appTheme = useMemo(() => {
    const isDarkMode = colorScheme === 'dark';

    const newTheme = adjustThemeForScreenSize(DefaultTheme, width, height);

    log.debug(LOG_PREFIX, "Calculated theme based on screen size: ", newTheme);

    return newTheme;
  }, [colorScheme, width, height]);


  return (
    <PaperProvider theme={appTheme}>
      <Snackbar />
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <JotaiProvider store={appStore}>
        <AppContent />
      </JotaiProvider>
    </SafeAreaProvider>
  );
}
