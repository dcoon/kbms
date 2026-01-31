import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Settings</ThemedText>
          <ThemedText style={styles.centerText} themeColor="textSecondary">
            Manage your Battery Management System configuration and preferences.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          <Collapsible title="Bluetooth Connection">
             <View style={styles.settingRow}>
                <ThemedText type="small">Enable Bluetooth</ThemedText>
                <Switch
                  value={bluetoothEnabled}
                  onValueChange={setBluetoothEnabled}
                />
             </View>
             <ThemedText type="small" themeColor="textSecondary" style={{marginTop: 8}}>
                {bluetoothEnabled ? "Searching for BMS..." : "Bluetooth is off"}
             </ThemedText>
          </Collapsible>

          <Collapsible title="Battery Configuration">
            <View style={styles.settingRow}>
               <ThemedText type="small">Capacity (Ah)</ThemedText>
               <ThemedText type="code">100</ThemedText>
            </View>
            <View style={styles.settingRow}>
               <ThemedText type="small">Nominal Voltage (V)</ThemedText>
               <ThemedText type="code">48</ThemedText>
            </View>
          </Collapsible>

          <Collapsible title="Alerts & Notifications">
            <View style={styles.settingRow}>
                <ThemedText type="small">Push Notifications</ThemedText>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                />
             </View>
             <ThemedText type="small" themeColor="textSecondary" style={{marginTop: 8}}>
                Receive alerts for overvoltage and overheating.
             </ThemedText>
          </Collapsible>
        </ThemedView>
        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: Spacing.one,
  },
});
