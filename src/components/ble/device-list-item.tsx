
import { List } from '@/components/list/list-item';
import { Bluetooth } from '@/services/ble/ble-service';
import { Device, getDeviceName, getIconForRssi, getIconForSoC } from '@/services/ble/ble-types';
import { Favorite } from '@/services/settings/settings-service';
import { useAtom } from 'jotai';
import React from 'react';
import { View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { FavoriteIcon } from '../ui/favorite-icon';



type DeviceOrFavorite = Device | Favorite;

type OnDevicePress = (device: DeviceOrFavorite) => void;


function LeftContent({ device }: { device: DeviceOrFavorite }) {
  // return <List.Icon icon="devices" />;
  return (<FavoriteIcon favorite={device as Favorite} />);
}


function DeviceIcons({ device }: { device: DeviceOrFavorite }) {

  const rssi = (device as Device).rssi;
  const rssiIcon = getIconForRssi(rssi);


  return (
    <List.Icon icon={rssiIcon.name} color={rssiIcon.color} />
  );}


  function BatteryIsConnectedIcon({ device }: { device: DeviceOrFavorite }) {

    const [isConnectedLoadable, setIsConnected] = useAtom(Bluetooth.isBatteryConnected(device?.id));
    const isConnected = isConnectedLoadable.state === 'hasData' && isConnectedLoadable.data === true;

    return (
      <IconButton icon={isConnected ? "stop" : "play"} onPress={() => setIsConnected(!isConnected)} />
    );
  }

  function BatterySocIcon({ device }: { device: DeviceOrFavorite }) {

    const [battery] = useAtom(Bluetooth.battery(device?.id));
    const socIcon = getIconForSoC(battery?.soc);

    return (
      <List.Icon icon={socIcon.name} color={socIcon.color} />
    );
  }

  function BatteryIcons({ device }: { device: DeviceOrFavorite }) {

    const [isKnownBatteryTypeLoadable] = useAtom(Bluetooth.isKnownBatteryType(device?.id));
    const isKnownBatteryType = isKnownBatteryTypeLoadable.state === 'hasData' && isKnownBatteryTypeLoadable.data === true;

    if (!isKnownBatteryType) {
      return null;
    }

    return (
      <View style={{ flexDirection: 'row' }}>
        <BatteryIsConnectedIcon device={device} />
        <BatterySocIcon device={device} />
      </View>
    );
  }

function RightContent({ device }: { device: DeviceOrFavorite }) {

  return (
    <View style={{ alignContent: 'flex-end' }}>
      <View style={{ flexDirection: 'row' }}>
        <BatteryIcons device={device} />
        <DeviceIcons device={device} />
      <List.Icon icon="chevron-right" />

      </View>
    </View>
  );
}


interface DeviceListItemProps {
  device: DeviceOrFavorite;
  onDevicePress?: OnDevicePress;
}



export function DeviceListItem({ device, onDevicePress }: DeviceListItemProps) {

  const deviceName = getDeviceName(device);

  

  return (
    <List.Item
      title={deviceName}
      description={device.id}
      left={<LeftContent device={device} />}
      right={<RightContent device={device} />}
      value={undefined}
      onPress={() => { onDevicePress?.(device as DeviceOrFavorite) }}
    >
      <Text>foobar money</Text>
    </List.Item>
  );
}
