import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, List, Switch, useTheme, Divider, Card } from 'react-native-paper';

import { WebBadge } from '@/components/web-badge';

export default function SettingsScreen() {
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{ padding: 20 }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>Settings</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>
            Manage your Battery Management System configuration and preferences.
          </Text>

          <Card style={{ backgroundColor: theme.colors.surface, borderRadius: 16 }} elevation={1}>
            <List.Section>
              <List.Subheader>Connectivity</List.Subheader>
              <List.Item
                title="Bluetooth Enabled"
                description={bluetoothEnabled ? "Searching for BMS..." : "Bluetooth is currently off"}
                left={props => <List.Icon {...props} icon="bluetooth" />}
                right={() => (
                  <Switch
                    value={bluetoothEnabled}
                    onValueChange={setBluetoothEnabled}
                    color={theme.colors.primary}
                  />
                )}
              />
              <Divider />
              <List.Subheader>Battery Configuration</List.Subheader>
              <List.Item
                title="Capacity"
                description="Total energy storage capacity"
                left={props => <List.Icon {...props} icon="battery-charging" />}
                right={() => <Text variant="bodyLarge" style={{ alignSelf: 'center', marginRight: 16, fontWeight: 'bold' }}>100 Ah</Text>}
              />
              <List.Item
                title="Nominal Voltage"
                description="System design voltage"
                left={props => <List.Icon {...props} icon="flash" />}
                right={() => <Text variant="bodyLarge" style={{ alignSelf: 'center', marginRight: 16, fontWeight: 'bold' }}>48 V</Text>}
              />
              <Divider />
              <List.Subheader>Preferences</List.Subheader>
              <List.Item
                title="Push Notifications"
                description="Alerts for overvoltage and overheating"
                left={props => <List.Icon {...props} icon="bell-outline" />}
                right={() => (
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    color={theme.colors.primary}
                  />
                )}
              />
            </List.Section>
          </Card>
          
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <WebBadge />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
