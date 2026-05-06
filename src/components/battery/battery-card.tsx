
import { ValueChip } from '@/components/ui/value-chip';
import { BatteryData } from "@/services/battery/battery";
import * as Battery from '@/services/battery/battery-service';
import { socIconSource } from "@/services/battery/icons";
import { Device, DeviceId } from '@/services/ble/ble';
import { Favorite } from '@/services/settings/settings-service';
import { DefaultTheme } from '@/theme/theme';
import { useAtom } from 'jotai';
import React from 'react';
import { View } from 'react-native';
import { Card, Icon, IconButton, Menu, Text, useTheme } from 'react-native-paper';
import { OnDevicePress } from '../ble/ble';
import { IconFromIconSource } from '../ble/icons';
import { Gauge } from '../ui/gauge';
import { BatteryIsConnectedIcon, BatteryLastSeenListIcon, FavoriteIcon, IconMenuOrButton } from "./icons";


function LeftContent({ battery }: { battery: BatteryData }) {

  const theme = useTheme() as typeof DefaultTheme;
  const soc = battery.soc; //battery.soc;
  const icon = socIconSource({ soc: soc, theme });

  return (
    <View style={theme.components.Card.Title.leftStyle as any}>
      <IconFromIconSource source={icon} theme={theme} />
    </View>
  );
}

function RightContent({ battery }: { battery: BatteryData }) {

  const theme = useTheme() as typeof DefaultTheme;
  return (
    <View style={theme.components.Card.Title.rightStyle as any}>
      {/* <BatteryIcons battery={battery} /> */}
      {/* <RssiIcon battery={battery} /> */}
      {/* <BatteryIsConnectedIcon battery={battery} /> */}
      {/* <BatteryDeltaVIcon deltav={battery.deltav} /> */}
      <BatteryLastSeenListIcon battery={battery} />
      {/* <Icon source="dots-vertical" size={24} /> */}
      <BatteryCardMenu battery={battery} />

    </View>
  );
}

function BatteryCardMenu({ battery }: { battery: BatteryData }) {


  const [visible, setVisible] = React.useState(false);
  const theme = useTheme() as typeof DefaultTheme;


  const onOpenMenu = () => setVisible(true);
  const onCloseMenu = () => setVisible(false);


  return (<Menu
    visible={visible}
    onDismiss={onCloseMenu}
    anchor={<IconButton icon="dots-vertical" size={theme.icons.iconSize} onPress={onOpenMenu} style={{ padding: 8 }} />}>

    <FavoriteIcon device={battery} onPress={onCloseMenu} iconMenuOrButton={IconMenuOrButton.Menu} />
    <BatteryIsConnectedIcon battery={battery} onPress={onCloseMenu} iconMenuOrButton={IconMenuOrButton.Menu} />

  </Menu>
  );
}


function BatteryCardContent({ battery }: { battery?: Partial<BatteryData> }) {

  const theme = useTheme() as typeof DefaultTheme;

  const soc = battery?.soc;
  const socIS = soc !== undefined ? socIconSource({ soc, theme }) : theme.icons.battery.soc.unknown;

  const strokeColor = (socIS as { source: string; color: string; size: number }).color;
  const voltage = battery?.voltage != undefined ? battery.voltage / 1000 : undefined;
  const current = battery?.current !== undefined ? battery.current / 1000 : undefined;
  const watts = voltage && current !== undefined ? voltage * current : undefined;
  const deltav = battery?.deltav;


  const voltageText = voltage?.toFixed(2);
  const currentText = current?.toFixed(2);
  const wattsText = watts ? Math.round(watts) : undefined;
  const deltavText = deltav ? Math.round(deltav) : undefined;

  const radius = theme.components.Gauge.small.radius;

  return (
    <Card.Content
      style={theme.components.Card.Content.style as any}
    >
      <Gauge
        value={soc}
        maxvalue={100}
        title="SOC"
        valuesuffix='%'
        variant={theme.components.Gauge.small}
        strokecolor={strokeColor}
      />
      <ValueChip value={voltageText} valueSuffix="V" title="Voltage" />
      <ValueChip value={currentText} valueSuffix="A" title="Current" />
      {/* <ValueChip value={wattsText} valueSuffix="W" title="Watts" /> */}
      <ValueChip value={deltavText} valueSuffix="mV" title="Delta V" />
    </Card.Content>
  );
}


interface BatteryCardProps {
  deviceOrFavorite: Device | Favorite;
  onDevicePress?: OnDevicePress;
}

export function BatteryCard({ deviceOrFavorite, onDevicePress }: BatteryCardProps) {
  const theme = useTheme() as typeof DefaultTheme;
  const deviceId = ('deviceId' in deviceOrFavorite ? deviceOrFavorite.deviceId : deviceOrFavorite.id) as DeviceId;
  const name = deviceOrFavorite.name || deviceId;

  const [discoveredBattery] = useAtom(Battery.battery(deviceId));

  const battery = discoveredBattery ? discoveredBattery : { id: deviceId, name: name } as BatteryData;

  // TODO: ensure batteries have deviceId
  battery.id = deviceId;
  battery.name = name;

  return (
    <Card
      key={deviceId}
      onPress={() => { onDevicePress?.(battery.id) }}
      theme={theme.components.Card.theme as any}
      style={theme.components.Card.style as any}
    >
      <Card.Title
        title={name}
        // subtitle={discoveredBattery ? " " : "Loading..."}
        left={(props) => <LeftContent battery={battery} />}
        right={(props) => <RightContent battery={battery} />}
        style={theme.components.Card.Title.style}
        leftStyle={theme.components.Card.Title.leftStyle as any}
        rightStyle={theme.components.Card.Title.rightStyle as any}
        titleStyle={theme.components.Card.Title.titleStyle as any}

      />
      <BatteryCardContent battery={discoveredBattery} />
    </Card>

  );
}



export function BatteryCardEmpty({ onDevicePress }: { onDevicePress?: OnDevicePress }) {
  const theme = useTheme() as typeof DefaultTheme;
  return (
    <Card
      key="empty"
      onPress={() => { onDevicePress?.("") }}
      theme={theme.components.Card.theme as any}
      style={theme.components.Card.style as any}

    >
      <Card.Title
        title="No Batteries"
        left={(props) => <Icon source={theme.icons.battery.soc.unknown.source} size={theme.icons.iconSize} />}
        style={theme.components.Card.Title.style}
        leftStyle={theme.components.Card.Title.leftStyle as any}
        rightStyle={theme.components.Card.Title.rightStyle as any}
        titleStyle={theme.components.Card.Title.titleStyle as any}
      />
      <Card.Content
        style={theme.components.Card.Content.style as any}

      >
        {/* <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 24 }} > */}
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>You have no saved batteries yet. Click here to add a battery.</Text>
        {/* </View> */}
      </Card.Content>
    </Card>
  );
}