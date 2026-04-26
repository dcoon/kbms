
import { List } from '@/components/list/list-item';
import { Device, getDeviceName } from '@/services/ble/ble-types';
import { Favorite } from '@/services/settings/settings-service';
import { useAtom } from 'jotai';
import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { FavoriteIcon } from '../ui/favorite-icon';

import * as Battery from '@/services/ble/battery-service';
import log from '@/services/log/log-service';
import { RssiIcon } from './ble';



type OnDevicePress = (device: Device) => void;


function LeftContent({ device }: { device: Device }) {
  // return <List.Icon icon="devices" />;
  return (<FavoriteIcon favorite={device as Favorite} />);
}


function DeviceIcons({ device }: { device: Device }) {

  const rssi = device.rssi;

  return (
    <RssiIcon rssi={rssi} />
  );
}


// function BatteryIsConnectedIcon({ device }: { device: Device }) {

//   const [isConnectedLoadable, setIsConnected] = useAtom(Battery.isBatteryConnected(device?.id));
//     const isConnected = ConnectionStateFromLoadable({ loader: isConnectedLoadable });


//   return (
//     <ButtonForConnectionState isDeviceConnected={isConnected} onPress={() => setIsConnected(!isConnected)} />
//   );
// }

// function BatterySocIcon({ device }: { device: Device }) {

//   const [battery] = useAtom(Battery.battery(device?.id));

//   return (
//     <IconForSoC soc={battery?.soc} />
//   );
// }

// function BatteryIcons({ device }: { device: Device }) {

//   const [isKnownBatteryTypeLoadable] = useAtom(Battery.isKnownBatteryType(device?.id));
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

function RightContent({ device }: { device: Device }) {

  return (
    <View style={{ alignContent: 'flex-end' }}>
      <View style={{ flexDirection: 'row' }}>
        {/* <BatteryIcons device={device} /> */}
        <DeviceIcons device={device} />
        <List.Icon icon="chevron-right" />

      </View>
    </View>
  );
}


interface DeviceListItemProps {
  device: Device;
  onDevicePress?: OnDevicePress;
  hideIfUnknownBatteryType?: boolean;
}



function DeviceListItemImpl({ device, onDevicePress, hideIfUnknownBatteryType }: DeviceListItemProps) {
  const deviceName = getDeviceName(device);

  return (
    <List.Item
      title={deviceName}
      description={device.id}
      left={<LeftContent device={device} />}
      right={<RightContent device={device} />}
      value={undefined}
      onPress={() => { onDevicePress?.(device as Device) }}
    >
      <Text>foobar money</Text>
    </List.Item>
  );
}

function DeviceListItemIfKnownBatteryType(props: DeviceListItemProps) {

  const LOG_PREFIX = "DeviceListItemIfKnownBatteryType: ";

  const [isKnownBatteryTypeLoadable] = useAtom(Battery.isKnownBatteryType(props.device?.id));
  // const isKnownBatteryType = isKnownBatteryTypeLoadable.state === 'hasData' && isKnownBatteryTypeLoadable.data === true;

  if (isKnownBatteryTypeLoadable.state === 'hasData') {
    if (isKnownBatteryTypeLoadable.data) {
      return <DeviceListItemImpl {...props} />
    } else {
      // not a battery type we recognize,
      return null;
    }
  } else if (isKnownBatteryTypeLoadable.state === 'loading') {
    log.debug(`${LOG_PREFIX} Battery type for device ${props.device.id} is loading...`);
    return null;
  } else if (isKnownBatteryTypeLoadable.state === 'hasError') {
    log.error(`${LOG_PREFIX} Error loading battery type for device ${props.device.id}: ${isKnownBatteryTypeLoadable.error}`);
    return null;
  } else {
    log.error(`${LOG_PREFIX} Unknown loadable state for battery type of device ${props.device.id}`);
    return null;
  }

}

export function DeviceListItem({ device, onDevicePress, hideIfUnknownBatteryType }: DeviceListItemProps) {

  if (hideIfUnknownBatteryType) {
    return <DeviceListItemIfKnownBatteryType device={device} onDevicePress={onDevicePress} hideIfUnknownBatteryType={hideIfUnknownBatteryType} />
  } else {
    return <DeviceListItemImpl device={device} onDevicePress={onDevicePress} hideIfUnknownBatteryType={hideIfUnknownBatteryType} />
  }

}
