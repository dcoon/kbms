
import { Bluetooth } from '@/services/ble/ble-service';
import { Loadable } from '@/services/ble/ble-types';
import { useAtom } from 'jotai';
import React from 'react';
import { View } from 'react-native';
import { Characteristic } from 'react-native-ble-plx';
import { List } from 'react-native-paper';


type OnCharacteristicPress = (characteristic: Characteristic) => void;


interface CharacteristicListItemProps {
  characteristic: Characteristic | undefined;
  onCharacteristicPress?: OnCharacteristicPress;
}



function LeftContent() {
  return (
    <List.Icon icon="tag-multiple-outline" />
  );
}


function getIsNotifyingIconFromLoadable(isNotifyingLoadable: Loadable<boolean>) {

  switch(isNotifyingLoadable.state) {
    case 'loading':
      return 'refresh';
    case 'hasData':
      return isNotifyingLoadable.data ? 'bell-ring' : 'bell';
    case 'hasError':
      return 'alert-circle-outline';
    default:
      return 'help-circle-outline';
  }
  
}

function IsNotifyingIcon({  characteristic }: { characteristic: Characteristic }) {
  const [isNotifyingLoadable] = useAtom(Bluetooth.characteristicIsNotifying({ deviceId: characteristic.deviceID, serviceUUID: characteristic.serviceUUID, characteristicUUID: characteristic.uuid }));

  const icon = getIsNotifyingIconFromLoadable(isNotifyingLoadable);

  return (
    <List.Icon icon={icon} />
  );

}

function RightContent({ characteristic }: { characteristic: Characteristic }) {

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {characteristic.isReadable && <List.Icon icon="read" />}
      {characteristic.isWritableWithResponse && <List.Icon icon="pencil-outline" />}
      {characteristic.isNotifiable && <IsNotifyingIcon characteristic={characteristic} />}

    </View>
  );
}

export function CharacteristicListItem({ characteristic, onCharacteristicPress }: CharacteristicListItemProps) {

  return (
    <List.Item
      title={characteristic?.uuid}
      description={characteristic?.id}
      left={LeftContent}
      right={() => <RightContent characteristic={characteristic as Characteristic} />}
      onPress={() => { onCharacteristicPress?.(characteristic as Characteristic) }}
    />
  );
}
