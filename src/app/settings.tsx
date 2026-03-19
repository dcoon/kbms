import { useSettingsContext } from '@/components/settings-provider';
import { WebBadge } from '@/components/web-badge';
import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Appbar, Button, List, Switch, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';


type LogLevel = 'error' | 'warning' | 'info' | 'debug';

export default function SettingsScreen() {
  const theme = useTheme();

  const settings = useSettingsContext();

  const logLevelOptions = [
    { label: 'Error', value: 'error' },
    { label: 'Warning', value: 'warn' },
    { label: 'Info', value: 'info' },
    { label: 'Debug', value: 'debug' },
  ];

  return (
    <SafeAreaView>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>
      <ScrollView contentInsetAdjustmentBehavior="automatic">

          <List.Section>

            <List.Accordion title="Notifications" description="Control app notifications and alerts" left={props => <List.Icon {...props} icon="bell" />}  >
              {BooleanSetting("Enable Notifications", "Allow the app to send you notifications about important events", settings?.notificationsEnabled as boolean, (value) => {
                if (settings) {
                  settings.notificationsEnabled = value;
                }
              })}
            </List.Accordion>

            <List.Accordion title="Logging" description="Configure log collection and error reporting" left={props => <List.Icon {...props} icon="bug" />}  >
              {BooleanSetting("Send Logs to Server", "Allow the app to send logs to the server for diagnostics", settings?.sendLogsToServer as boolean, (value) => {
                if (settings) {
                  settings.sendLogsToServer = value;
                }
              })}


              {PickerSetting("Log Level", "Set the log level for the app", logLevelOptions, settings?.logLevel || 'error', (value) => {
                if (settings) {
                  settings.logLevel = value as LogLevel;
                }
              })}


              {ButtonSetting( "Share Logs", "Share the current logs for debugging purposes", () => alert('Sharing logs...'))}

            </List.Accordion>


            <List.Accordion title="Data" description="Manage your stored data" left={props => <List.Icon {...props} icon="data-matrix" />}  >
              {ButtonSetting( "Clear Settings", "Clear ALL settings", () => settings ? settings.clear = true : null)}
              {ButtonSetting( "Clear Favorites", "Clear your list of favorite devices", () => settings ? settings.favorites = [] : null)}
            </List.Accordion>


          </List.Section>

          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <WebBadge />
          </View>
      </ScrollView>
    </SafeAreaView>
  );

  function ButtonSetting(title: string, description: string, onPress: () => void) {
    return <List.Item
      title={title}
      description={description}

      right={() => (
        <Button mode="outlined" onPress={onPress}>{title}</Button>
      )} />;
  }

  function BooleanSetting(title: string = "Send Logs to Server", description: string, value: boolean, onValueChange: (value: boolean) => void) {
    return <List.Item
      title={title}
      description={description}
      right={() => (
        <Switch
          value={value}
          onValueChange={onValueChange}
          color={theme.colors.primary} />
      )} />;
  }

  function PickerSetting(title: string, description: string, items: { label: string, value: string }[], selectedValue: string, onValueChange: (itemValue: string) => void) {
    return <List.Item title={title} description={description}
      right={() => (  
        <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={{ width: 150 }}>
          {items.map(item => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
      )} />;
  }
   
   
}
