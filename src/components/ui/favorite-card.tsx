
import { battery as batteryAtom, isBatteryConnected } from '@/services/ble/battery-service';
import { Device, getDeviceName } from '@/services/ble/ble-types';
import { Favorite } from '@/services/settings/settings-service';
import { PaperTheme } from '@/util/paper-theme';
import { useAtom } from 'jotai';
import React from 'react';
import { View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';
import { IconForConnectionState, IconForRssi } from '../ble/ble';
import { Gauge } from './gauge';
import { DEFAULT_ICON_SIZE } from './ui-util';



type DeviceOrFavorite = Device | Favorite;

type OnDevicePress = (device: DeviceOrFavorite) => void;



function BatteryIsConnectedIcon({ device }: { device: DeviceOrFavorite }) {

  const [isConnectedLoadable, setIsConnected] = useAtom(isBatteryConnected(device?.id));
  const isConnected = isConnectedLoadable.state === 'hasData' && isConnectedLoadable.data === true;

  return (
    <IconForConnectionState isDeviceConnected={isConnected} onPress={() => setIsConnected(!isConnected)}/>
  );
}

function RssiIcon({ device }: { device: DeviceOrFavorite }) {
  const rssi = (device as Device).rssi;

  return (
    <IconForRssi rssi={rssi} />

  );
}

function LeftContent({ device }: { device: DeviceOrFavorite }) {
  // return <List.Icon icon="devices" />;
  // return (<FavoriteIcon favorite={device as Favorite} />);
  return (
    <View style={{ paddingVertical: 0 }}>
      <Icon source="car-battery" size={32} />
    </View>
  );
}

function RightContent({ device }: { device: DeviceOrFavorite }) {

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', columnGap: 0 }}>
      {/* <BatteryIcons device={device} /> */}
      <RssiIcon device={device} />
      <BatteryIsConnectedIcon device={device} />
      <Icon source="dots-vertical" size={DEFAULT_ICON_SIZE} />

    </View>
  );
}



function BatteryValueCard({ value, valueSuffix, title }: { value?: number, valueSuffix?: string, title: string }) {
  return (
    <View style={{ alignItems: 'center', flexDirection: 'column' }}>
      <Text variant='labelLarge'>{value !== undefined ? value : '?'}{valueSuffix}</Text>
      <Text variant='labelMedium'>{title}</Text>
    </View>
  );
}


function FavoriteCardContent({ device }: { device: DeviceOrFavorite }) {

  const theme = useTheme() as typeof PaperTheme;
  const [battery] = useAtom(batteryAtom(device?.id));

  const soc = battery?.soc;
  const voltage = battery?.voltage ? Math.round(battery.voltage) / 1000 : undefined;
  const current = battery?.current !== undefined ? Math.round(battery.current) : undefined;
  // const capacity = battery?.capacity;
  const watts = voltage && current !== undefined ? Math.round(voltage * current) : undefined;
  // const runtime = battery?.capacity;

  return (
    <Card.Content 
      style={theme.components.Card.Content.style as any} 
    >
      <Gauge value={soc} title="SOC" />
      <BatteryValueCard value={voltage} valueSuffix="V" title="Voltage" />
      <BatteryValueCard value={current} valueSuffix="A" title="Current" />
      <BatteryValueCard value={watts} valueSuffix="W" title="Watts" />
    </Card.Content>
  );
}


interface FavoriteCardProps {
  device: DeviceOrFavorite;
  onDevicePress?: OnDevicePress;
}

export function FavoriteCard({ device, onDevicePress }: FavoriteCardProps) {
  const theme = useTheme() as typeof PaperTheme;

  const deviceName = getDeviceName(device);


  return (
    <Card
      onPress={() => { onDevicePress?.(device as DeviceOrFavorite) }}
      theme={theme.components.Card.theme as any}
      style={theme.components.Card.style as any}
    >
      <Card.Title
        title={deviceName}
        // subtitle={device.id}
        left={(props) => <LeftContent device={device} />}
        right={(props) => <RightContent device={device} />}
        style={theme.components.Card.Title.style}
        leftStyle={theme.components.Card.Title.leftStyle as any}
        titleStyle={theme.components.Card.Title.titleStyle as any}

      />
      <FavoriteCardContent device={device} />
    </Card>

  );
}
