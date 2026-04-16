
import { battery as batteryAtom, isBatteryConnected } from '@/services/ble/battery-service';
import { Device, getDeviceName, getIconForRssi } from '@/services/ble/ble-types';
import { Favorite } from '@/services/settings/settings-service';
import { PaperTheme } from '@/util/paper-theme';
import { useAtom } from 'jotai';
import React from 'react';
import { View } from 'react-native';
import { Card, Icon, IconButton, Text, useTheme } from 'react-native-paper';
import { Gauge } from './gauge';



type DeviceOrFavorite = Device | Favorite;

type OnDevicePress = (device: DeviceOrFavorite) => void;

const default_icon_size = 24;


function BatteryIsConnectedIcon({ device }: { device: DeviceOrFavorite }) {

  const [isConnectedLoadable, setIsConnected] = useAtom(isBatteryConnected(device?.id));
  const isConnected = isConnectedLoadable.state === 'hasData' && isConnectedLoadable.data === true;

  return (
    <IconButton
      icon={isConnected ? "stop" : "refresh"}
      size={default_icon_size}
      style={{ margin: 0 }}
      onPress={() => setIsConnected(!isConnected)}
    />
  );
}

function RssiIcon({ device }: { device: DeviceOrFavorite }) {
  const rssi = (device as Device).rssi;
  const rssiIcon = getIconForRssi(rssi);

  return (
    <Icon source={rssiIcon.name} color={rssiIcon.color} size={default_icon_size} />

  );
}

// function BatterySocIcon({ device }: { device: DeviceOrFavorite }) {

//   const [battery] = useAtom(Bluetooth.battery(device?.id));
//   const socIcon = getIconForSoC(battery?.soc);

//   const soc = battery?.soc ?? 0;
//   return (<View>
//     <Icon source={socIcon.name} color={socIcon.color} size={24} />
//   </View>);
// }

// function BatteryIcons({ device }: { device: DeviceOrFavorite }) {

//   const [isKnownBatteryTypeLoadable] = useAtom(Bluetooth.isKnownBatteryType(device?.id));
//   const isKnownBatteryType = isKnownBatteryTypeLoadable.state === 'hasData' && isKnownBatteryTypeLoadable.data === true;

//   if (!isKnownBatteryType) {
//     return null;
//   }

//   return (
//     <View style={{ flexDirection: 'row' }}>
//       <BatteryIsConnectedIcon device={device} />
//       <BatterySocIcon device={device} />
//     </View>
//   );
// }

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
      <Icon source="dots-vertical" size={default_icon_size} />

    </View>
  );
}



function BatteryValueCard({ value, valueSuffix, title }: { value?: number, valueSuffix?: string, title: string }) {
  return (
    <View style={{ alignItems: 'center', flexDirection: 'column' }}>
      <Text variant='labelLarge'>{value ? value : '?'}{valueSuffix}</Text>
      <Text variant='labelMedium'>{title}</Text>
    </View>
  );
}


function FavoriteCardContent({ device }: { device: DeviceOrFavorite }) {

  const theme = useTheme() as typeof PaperTheme;


  const [battery] = useAtom(batteryAtom(device?.id));
  const soc = battery?.soc;
  const voltage = battery?.voltage ? Math.round(battery.voltage) / 1000 : undefined;
  const current = battery?.current ? Math.round(battery.current) : undefined;
  // const capacity = battery?.capacity;
  const watts = voltage && current ? Math.round(voltage * current) : undefined;
  // const runtime = battery?.capacity;

  return (
    <Card.Content style={theme.components.Card.Content.style as any} >
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
