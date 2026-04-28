
import { ValueChip } from '@/components/ui/ui-util';
import { battery as batteryAtom, isBatteryConnected } from '@/services/ble/battery-service';
import { Bluetooth } from '@/services/ble/ble-service';
import { getDeviceName } from '@/services/ble/ble-types';
import { Settings } from '@/services/settings/settings-service';
import { DefaultTheme } from '@/theme/theme';
import { useAtom } from 'jotai';
import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Card, Icon, IconButton, Menu, useTheme } from 'react-native-paper';
import { socIconSource } from '../ble/battery';
import { BatteryLastSeenListIcon, ConnectionStateFromLoadable, ConnectionStateIconSource, ConnectionStateMenuText, DeviceOrFavorite, OnDevicePress } from '../ble/ble';
import { Gauge } from './gauge';
import { DEFAULT_ICON_SIZE } from './ui-util';


function LeftContent({ device }: { device: DeviceOrFavorite }) {

  const theme = useTheme() as typeof DefaultTheme;

  return (
    <View style={theme.components.Card.Title.leftStyle as any}>
      <Icon source={theme.icons.battery.high.source} size={theme.icons.iconSize} />
    </View>
  );
}

function RightContent({ device }: { device: DeviceOrFavorite }) {

  const theme = useTheme() as typeof DefaultTheme;
  return (
    <View style={theme.components.Card.Title.rightStyle as any}>
      {/* <BatteryIcons device={device} /> */}
      {/* <RssiIcon device={device} /> */}
      {/* <BatteryIsConnectedIcon device={device} /> */}
      <BatteryLastSeenListIcon device={device} />
      {/* <Icon source="dots-vertical" size={DEFAULT_ICON_SIZE} /> */}
      <FavoriteCardMenu device={device} />

    </View>
  );
}

function FavoriteCardMenu({ device }: { device: DeviceOrFavorite }) {

  const [isBatteryConnectedLoadable, setIsBatteryConnected] = useAtom(isBatteryConnected(device.id));
  const [favorite, toggleIsFavorite] = useAtom(Settings.favorite({ id: device.id, name: "" }));

  const [visible, setVisible] = React.useState(false);
  const theme = useTheme() as typeof DefaultTheme;


  const onOpenMenu = () => setVisible(true);
  const onCloseMenu = () => setVisible(false);


  function onPressRemove() {
    toggleIsFavorite({ id: device.id, name: "" });
    onCloseMenu();
  }

  function onPressConnectionState() {
    const isConnected = isBatteryConnectedLoadable.state === 'hasData' && isBatteryConnectedLoadable.data === true;
    setIsBatteryConnected(!isConnected);
    onCloseMenu();
  }

  const isBatteryConnectedState = ConnectionStateFromLoadable({ loader: isBatteryConnectedLoadable });
  const batteryConnectedIconSource = ConnectionStateIconSource(isBatteryConnectedState);
  const batteryConnectedMenuText = ConnectionStateMenuText(isBatteryConnectedState);

  return (<Menu
    visible={visible}
    onDismiss={onCloseMenu}
    anchor={<IconButton icon="dots-vertical" size={DEFAULT_ICON_SIZE} onPress={onOpenMenu} style={{ padding: 8 }} />}>
    <Menu.Item onPress={onPressRemove} title="Remove" leadingIcon="heart-remove-outline" />
    <Menu.Item onPress={onPressConnectionState} title={batteryConnectedMenuText} leadingIcon={(batteryConnectedIconSource as any).source} />
  </Menu>
  );
}


function FavoriteCardContent({ device }: { device: DeviceOrFavorite }) {

  const theme = useTheme() as typeof DefaultTheme;
  const [battery] = useAtom(batteryAtom(device?.id));

  const soc = battery?.soc;
  const socIC = socIconSource({ soc, theme });
  const strokeColor = socIC.color;
  const voltage = battery?.voltage ? Math.round(battery.voltage) / 1000 : undefined;
  const current = battery?.current !== undefined ? Math.round(battery.current) / 1000 : undefined;
  // const capacity = battery?.capacity;
  const watts = voltage && current !== undefined ? Math.round(voltage * current) : undefined;
  // const runtime = battery?.capacity;

  const { width, height } = useWindowDimensions();
  const radius = theme.components.Gauge.small.radius;

  return (
    <Card.Content
      style={theme.components.Card.Content.style as any}
    >
      <Gauge value={soc}
        maxvalue={100}
        title="SOC"
        valuesuffix='%'
        variant={theme.components.Gauge.small}
        strokecolor={strokeColor}
     />
      <ValueChip value={voltage} valueSuffix="V" title="Voltage" />
      <ValueChip value={current} valueSuffix="A" title="Current" />
      <ValueChip value={watts} valueSuffix="W" title="Watts" />
    </Card.Content>
  );
}


interface FavoriteCardProps {
  favorite: DeviceOrFavorite;
  onDevicePress?: OnDevicePress;
}

export function FavoriteCard({ favorite, onDevicePress }: FavoriteCardProps) {
  const theme = useTheme() as typeof DefaultTheme;

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
        rightStyle={theme.components.Card.Title.rightStyle as any}
        titleStyle={theme.components.Card.Title.titleStyle as any}

      />
      <FavoriteCardContent device={device ? device : favorite} />
    </Card>

  );
}
