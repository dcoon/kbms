
import { List } from '@/components/list/list-item';
import { Bluetooth } from '@/services/ble/ble-service';
import { Device, getDeviceName, getIconForRssi, getIconForSoC } from '@/services/ble/ble-types';
import { Favorite } from '@/services/settings/settings-service';
import { useAtom } from 'jotai';
import React from 'react';
import { View } from 'react-native';
import { Card, Icon, IconButton, Text } from 'react-native-paper';
import { Gauge } from './gauge';



type DeviceOrFavorite = Device | Favorite;

type OnDevicePress = (device: DeviceOrFavorite) => void;




function DeviceIcons({ device }: { device: DeviceOrFavorite }) {

  const rssi = (device as Device).rssi;
  const rssiIcon = getIconForRssi(rssi);


  return (
    <View style={{ flexDirection: 'row' }}>

    <List.Icon icon={rssiIcon.name} color={rssiIcon.color} />
    <BatteryIsConnectedIcon device={device} />
    </View>
  );
}


function BatteryIsConnectedIcon({ device }: { device: DeviceOrFavorite }) {

  const [isConnectedLoadable, setIsConnected] = useAtom(Bluetooth.isBatteryConnected(device?.id));
  const isConnected = isConnectedLoadable.state === 'hasData' && isConnectedLoadable.data === true;

  return (
    <IconButton icon={isConnected ? "stop" : "refresh"} onPress={() => setIsConnected(!isConnected)} />
  );
}

function BatterySocIcon({ device }: { device: DeviceOrFavorite }) {

  const [battery] = useAtom(Bluetooth.battery(device?.id));
  const socIcon = getIconForSoC(battery?.soc);

  const soc = battery?.soc ?? 0;
  return (<View>
    <Icon source={socIcon.name} color={socIcon.color} size={24} />
  </View>);
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
    <View style={{ alignContent: 'flex-end' }}>
      <View style={{ flexDirection: 'row' }}>
        {/* <BatteryIcons device={device} /> */}
        <DeviceIcons device={device} />
        <List.Icon icon="dots-vertical" />

      </View>
    </View>
  );
}



function BatteryValueCard({ value, valueSuffix, title }: { value?: number, valueSuffix?: string, title: string }) {
  return (
    <View style={{ alignItems: 'center', flexDirection: 'column' }}>
      <Text>{value}{valueSuffix}</Text>
      <Text>{title}</Text>
    </View>
  );
}


function FavoriteCardContent({ device }: { device: DeviceOrFavorite }) {

  const [battery] = useAtom(Bluetooth.battery(device?.id));
  const soc = battery?.soc ?? 76;
  const voltage = battery?.voltage ?? 13.02;
  const current = battery?.current ?? 11.2;
  const capacity = battery?.capacity;
  const watts = Math.round(voltage * current);
  // const runtime = battery?.capacity;

  return (
    <Card.Content>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
        <Gauge value={soc} title="SOC" />
        <BatteryValueCard value={voltage} valueSuffix="V" title="Voltage" />
        <BatteryValueCard value={current} valueSuffix="A" title="Current" />
        <BatteryValueCard value={watts} valueSuffix="W" title="Watts" />

        {/* <BatteryIcons device={device} />
        <DeviceIcons device={device} /> */}


      </View>
    </Card.Content>
  );
}


interface FavoriteCardProps {
  device: DeviceOrFavorite;
  onDevicePress?: OnDevicePress;
}

export function FavoriteCard({ device, onDevicePress }: FavoriteCardProps) {

  const deviceName = getDeviceName(device);


  return (
    <Card
      onPress={() => { onDevicePress?.(device as DeviceOrFavorite) }}>
      <Card.Title
        title={deviceName}
        // subtitle={device.id}
        left={(props) => <LeftContent device={device} />}
        right={(props) => <RightContent device={device} />} />
      <FavoriteCardContent device={device} />
    </Card>

  );
}
