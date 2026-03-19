import { router } from 'expo-router';
import React from 'react';
import { FlatList } from 'react-native';
import { Appbar, Card, List, TouchableRipple, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeviceCard } from '@/components/device-card';
import { useSettingsContext } from '@/components/settings-provider';
import { BlankDevice, DeviceId } from '@/services/ble-service';
import { uilog as log } from '@/services/log';




export default function DashboardScreen() {
  const theme = useTheme();
  theme.dark = true;

  const settings = useSettingsContext();


  const onDevicePress = (deviceId: DeviceId) => {
    log.debug("onDevicePress called with device: ", deviceId);

    log.debug(`Navigating to device detail screen for device ID: ${deviceId}`);
    router.push({
      pathname: '/devices/[id]',
      params: {
        id: deviceId ?? '',
      }
    })
  };


  const ListEmptyComponent = () => (
    <TouchableRipple onPress={() => router.push('/devices')}>
      <Card>
        <Card.Title title="No favorite devices yet" />
        <Card.Content>
          <List.Item
            title="Add a device"
            description="Go to the devices tab to add your favorite devices here."
            left={() => <List.Icon icon="heart-outline" />}
            right={() => (
              <List.Icon icon="arrow-right" />
            )}
          />
        </Card.Content>
      </Card>
    </TouchableRipple>
  );


  return (
    <SafeAreaView>
        <Appbar.Header>
          <Appbar.Content title="Home " />
        </Appbar.Header>


        <List.Section>
          <List.Subheader>Favorites</List.Subheader>
        </List.Section>

        <FlatList
          data={settings?.favorites}
          renderItem={({ item }) => (
            <DeviceCard
              device={new BlankDevice(item)}
              onDevicePress={onDevicePress}
            />

          )}
          keyExtractor={(item, index) => item || String(index)}
          ListEmptyComponent={ListEmptyComponent}
        />

    </SafeAreaView>
  );
}
