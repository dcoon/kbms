import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { Appbar, Card, List, TouchableRipple, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBleContext } from '@/components/ble-provider';
import { DeviceCard } from '@/components/device-card';
import { EventType, useEventBusContext } from '@/components/event-bus-provider';
import { useSettingsContext } from '@/components/settings-provider';
import { UserSettings } from '@/constants/user-settings';
import { Device, DeviceId } from '@/services/ble-service';
import { uilog as log } from '@/services/log';




export default function DashboardScreen() {
  const theme = useTheme();
  theme.dark = true;

  const settings = useSettingsContext<UserSettings>();
  const ble = useBleContext();
  const eventBus = useEventBusContext();

  const [favorites, setFavorites] = useState<Device[]>([]);

  // const initializeFavorites = useEffect(() => {
  //   if (settings?.favorites) {
  //   log.debug("HomeScreen: Initializing favorites from settings: ", settings.favorites);

  //     const favoriteDevices = settings.favorites.map((favorite) => { const d = new Device({id: favorite.id, name: favorite.name}); d.isFavorite = true; return d; }); // Create Device objects with isFavorite set to true
  //     setFavorites(favoriteDevices);
  //   }
  // }, [settings]);


  const subscribeToNotifications = useEffect(() => {
    const subscription = eventBus && eventBus.subscribe((notification) => {
      log.debug("Received notification: ", notification);
      // Handle the notification as needed
      if (notification.type === EventType.SettingsChanged) {
        const [key, value, newSettings] = notification.data;
        onSettingsChanged(key, value, newSettings);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [eventBus]);

  const onSettingsChanged = useCallback((key?: string, value?: any, newSettings?: UserSettings) => {
    log.debug("onSettingsChanged: ", key, value, newSettings);


    const newFavorites = key === 'favorites' && value !== undefined ? value : newSettings?.favorites;

    if(newFavorites !== favorites) {
      setFavorites(newFavorites);
    }


  }, []);


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
        <List.Subheader>System Overview</List.Subheader>
        <List.Item
          title="All Batteries Status"
          description="Placeholder for fancy graphs and stuff"
          left={() => <List.Icon icon="battery" />}
        />

      </List.Section>

      <List.Section>
        <List.Subheader>Favorites</List.Subheader>
      </List.Section>

      <FlatList
        data={favorites}
        renderItem={({ item }) => (
          <DeviceCard
            device={item}
            isFavorite={true}
            onDevicePress={onDevicePress}
          />

        )}
        keyExtractor={(item, index) => item?.id || String(index)}
        ListEmptyComponent={ListEmptyComponent}
      />

    </SafeAreaView>
  );
}
