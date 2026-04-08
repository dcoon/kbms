import { theme } from '@/constants/paper-theme';
import { DeviceFavorite, UserSettings } from '@/constants/user-settings';
import { Device } from '@/services/ble-service';
import { uilog as log } from '@/services/log';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';
import { useSettingsContext } from './settings-provider';

type OnFavoritePressCallback = (device: Device) => void;

interface FavoriteIconProps {
  device: Device | undefined;
  isFavorite?: boolean;
  onFavoritePress?: OnFavoritePressCallback;
}


export const FavoriteIcon = ({ device, isFavorite = false, onFavoritePress }: FavoriteIconProps) => {

  const settings = useSettingsContext<UserSettings>();
  
  onFavoritePress = onFavoritePress || onFavoritePressDefault;

  const icon = isFavorite ? 'heart' : 'heart-outline';
  const statusColor = isFavorite ? 'red' : theme.colors.onSurfaceVariant; //theme.colors.error : theme.colors.onSurfaceVariant;


  function onFavoritePressDefault(device: Device): void {

    // log.info("onFavoritePressDefault called with device ID: ", device.id);

    if (settings) {
      const favorites = settings.favorites.filter(fav => fav.id !== device.id) as DeviceFavorite[];
      const favIndex = settings.favorites.findIndex(fav => fav.id === device.id);
      log.info("onFavoritePressDefault new favorites: ", device.id, settings.favorites, favorites, favIndex);
      settings.favorites = favIndex > -1 ? [...favorites] : [...favorites, { id: device.id, name: device.name } as DeviceFavorite];


    }
  };


  return (
    <Pressable onPress={() => device && onFavoritePress(device)} style={{ padding: 8 }}>
      <MaterialCommunityIcons name={icon} size={20} color={statusColor} />
    </Pressable>
  );
};

