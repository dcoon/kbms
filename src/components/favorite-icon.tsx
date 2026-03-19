import { theme } from '@/constants/paper-theme';
import { DeviceId } from '@/services/ble-service';
import { uilog as log } from '@/services/log';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';
import { useSettingsContext } from './settings-provider';

type DeviceCallback = (deviceId: DeviceId) => void;

interface FavoriteIconProps {
  deviceId: DeviceId | undefined;
  isFavorite?: boolean | undefined;
  onFavoritePress?: DeviceCallback;
}


export const FavoriteIcon = ({ deviceId, isFavorite, onFavoritePress }: FavoriteIconProps) => {

  const settings = useSettingsContext();

  onFavoritePress = onFavoritePress || onFavoritePressDefault;

  if(deviceId && isFavorite === undefined) {
    isFavorite =settings?.favorites.includes(deviceId);
  }
  
  const icon = isFavorite ? 'heart' : 'heart-outline';
  const statusColor = isFavorite ? 'red' : theme.colors.onSurfaceVariant; //theme.colors.error : theme.colors.onSurfaceVariant;
  

  function onFavoritePressDefault(deviceId: DeviceId) : void {

  // const onFavoritePressDefault = useCallback<DeviceCallback>(deviceId: DeviceId) => {
    log.debug("onFavoritePressDefault called with device ID: ", deviceId);

    if (settings) {
      const favorites = settings.favorites.filter(fav => fav !== deviceId) as DeviceId[];
      const favIndex = settings.favorites.findIndex(fav => fav === deviceId);
      log.debug("onFavoritePressDefault new favorites: ", settings.favorites, favorites, favIndex);

      settings.favorites = favIndex > -1 ? [...favorites] : [...favorites, deviceId];


    }

  };

  
  return (
    <Pressable onPress={() => onFavoritePress(deviceId!)} style={{ padding: 8 }}>
      <MaterialCommunityIcons name={icon} size={20} color={statusColor} />
    </Pressable>
  );
};

