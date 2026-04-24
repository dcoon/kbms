
import { battery as batteryAtom, isBatteryConnected } from '@/services/ble/battery-service';
import { Bluetooth } from '@/services/ble/ble-service';
import { Device, getDeviceName } from '@/services/ble/ble-types';
import { Favorite } from '@/services/settings/settings-service';
import { PaperTheme } from '@/util/paper-theme';
import { useAtom } from 'jotai';
import React from 'react';
import { View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';
import { colorForSoc } from '../ble/battery';
import { ButtonForConnectionState, ConnectionStateFromLoadable, IconForRssi, OnDevicePress } from '../ble/ble';
import { Gauge } from './gauge';
import { DEFAULT_ICON_SIZE } from './ui-util';



export type DeviceOrFavorite = Device | Favorite;

function BatteryIsConnectedIcon({ device }: { device: DeviceOrFavorite }) {

  const [isConnectedLoadable, setIsConnected] = useAtom(isBatteryConnected(device.id));
  const connectedState = ConnectionStateFromLoadable({ loader: isConnectedLoadable });

  return (
    <ButtonForConnectionState isDeviceConnected={connectedState} onPress={() => setIsConnected(connectedState === 'connected' ? false : true)}/>
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
      <BatteryIsConnectedIcon device={device} />
      <RssiIcon device={device} />
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
  const strokeColor = colorForSoc(soc);
  const voltage = battery?.voltage ? Math.round(battery.voltage) / 1000 : undefined;
  const current = battery?.current !== undefined ? Math.round(battery.current) / 1000  : undefined;
  // const capacity = battery?.capacity;
  const watts = voltage && current !== undefined ? Math.round(voltage * current) : undefined;
  // const runtime = battery?.capacity;

  return (
    <Card.Content 
      style={theme.components.Card.Content.style as any} 
    >
      <Gauge value={soc} maxvalue={100} title="SOC" strokeColor={strokeColor} />
      <BatteryValueCard value={voltage} valueSuffix="V" title="Voltage" />
      <BatteryValueCard value={current} valueSuffix="A" title="Current" />
      <BatteryValueCard value={watts} valueSuffix="W" title="Watts" />
    </Card.Content>
  );
}


interface FavoriteCardProps {
  favorite: DeviceOrFavorite;
  onDevicePress?: OnDevicePress;
}

export function FavoriteCard({ favorite, onDevicePress }: FavoriteCardProps) {
  const theme = useTheme() as typeof PaperTheme;

  const [deviceLoader] = useAtom(Bluetooth.device({ deviceId: favorite.id }));
  const device = deviceLoader.state === 'hasData' ? deviceLoader.data : favorite;

  const deviceName = device ? getDeviceName(device) : getDeviceName(favorite);


  return (
    <Card
      onPress={() => { onDevicePress?.(device ? device : favorite) }}
      theme={theme.components.Card.theme as any}
      style={theme.components.Card.style as any}
    >
      <Card.Title
        title={deviceName}
        // subtitle={device.id}
        left={(props) => <LeftContent device={device ? device : favorite} />}
        right={(props) => <RightContent device={device ? device : favorite} />}
        style={theme.components.Card.Title.style}
        leftStyle={theme.components.Card.Title.leftStyle as any}
        titleStyle={theme.components.Card.Title.titleStyle as any}

      />
      <FavoriteCardContent device={device ? device : favorite} />
    </Card>

  );
}
