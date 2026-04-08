import { useLocalSearchParams, useRouter } from 'expo-router';

import { DeviceListItem } from '@/components/ble/device-list-item';
import { ServiceListItem } from '@/components/ble/service-list-item';
import { List } from '@/components/list/list-item';
import { IsNotifyingAction } from '@/components/ui/app-topbar';
import { LoadableGuard } from '@/components/ui/loadable';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Bluetooth } from '@/services/ble/ble-service';
import { Device } from '@/services/ble/ble-types';
import { useAtom } from 'jotai';
import React from 'react';
import { ScrollView, View } from 'react-native';
import base64 from 'react-native-base64';
import { Characteristic } from 'react-native-ble-plx';
import { IconButton, Text, TextInput } from 'react-native-paper';

const LOG_SRC = "CharacteristicScreen";


const LOADING_TEXT = 'Loading...';

function InformationAccordion({ characteristic }: { characteristic: Characteristic }) {
  const router = useRouter();
  const [deviceLoadable] = useAtom(Bluetooth.device({ deviceId: characteristic.deviceID }));
  const device = deviceLoadable.state === 'hasData' ? deviceLoadable.data : undefined;

  const [serviceLoadable] = useAtom(Bluetooth.service({ deviceId: characteristic.deviceID, serviceUUID: characteristic.serviceUUID }));
  const service = serviceLoadable.state === 'hasData' ? serviceLoadable.data : undefined;

  return (
    <List.Accordion title="Information" id="information" description="Information about the service" icon="information-outline">
      <List.Subheader>Device</List.Subheader>
      <DeviceListItem device={device ? device : { id: characteristic.deviceID } as Device} onDevicePress={() => router.navigate(`/devices/${characteristic.deviceID}`)} />
      <List.Subheader>Service</List.Subheader>
      <ServiceListItem service={service} onServicePress={() => router.navigate({ pathname: `/devices/[deviceid]/services/[serviceid]`, params: { deviceid: characteristic.deviceID, serviceid: characteristic.serviceUUID } })} />
      <List.Subheader>Properties</List.Subheader>
      <List.Item title="Readable" description="Is the characteristic readable" icon="tag-multiple" value={characteristic?.isReadable} />
      <List.Item title="Writable with Response" description="Is the characteristic writable with response" icon="tag-multiple" value={characteristic?.isWritableWithResponse} />
      <List.Item title="Writable without Response" description="Is the characteristic writable without response" icon="tag-multiple" value={characteristic?.isWritableWithoutResponse} />
      <List.Item title="Indicatable" description="Is the characteristic indicatable" icon="tag-multiple" value={characteristic?.isIndicatable} />
      <List.Item title="Notifiable" description="Is the characteristic notifiable" icon="tag-multiple" value={characteristic?.isNotifiable} />
      <List.Item title="Notifying" description="Is the characteristic currently notifying" icon="tag-multiple" value={characteristic?.isNotifying} />
    </List.Accordion>
  );
}

function CharacteristicValueEditor({ deviceId, serviceId, characteristicId }: { deviceId: string, serviceId: string, characteristicId: string }) {

  const [valueLoadable, setValue] = useAtom(Bluetooth.characteristicValue({ deviceId, serviceUUID: serviceId, characteristicUUID: characteristicId }));
  const value = valueLoadable.state === 'hasData' ? valueLoadable.data : undefined;
  const [newValue, setNewValue] = React.useState<string>(value ? value : "");

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <IconButton icon={valueLoadable.state === 'hasData' ? "play" : "refresh"} onPress={() => setValue(newValue ? newValue : "")} />
      <TextInput mode="outlined" value={newValue} onChangeText={text => setNewValue(text)} />
    </View>
  );

}


function ReadAccordion({ characteristic }: { characteristic: Characteristic }) {
  const cid = { deviceId: characteristic.deviceID, serviceUUID: characteristic.serviceUUID, characteristicUUID: characteristic.uuid };
  const [characteristicValueLoadable, refreshValue] = useAtom(Bluetooth.characteristicValue(cid));
  const characteristicValue = characteristicValueLoadable.state === 'hasData' ? characteristicValueLoadable.data : undefined;

  const rawValue = characteristicValue ? characteristicValue : "";
  const base64Value = rawValue ? base64.decode(rawValue) : "";
  const decimalValue = Number(rawValue);
  const hexValue = decimalValue ? decimalValue.toString(16) : "";

  const encoder = new TextEncoder();
  const decimalArray = encoder.encode(rawValue);
  const hexArray = Array.from(decimalArray).map(byte => byte.toString(16).padStart(2, '0')).join(':');

  function RightContent({ value }: { value: any }) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconButton icon={characteristicValueLoadable.state === 'hasData' ? "play" : "refresh"} onPress={() => refreshValue()} />
        <Text>{value}</Text>
      </View>
    );
  }


  return (
    <List.Accordion title="Read" id="read" description="Read the value of the characteristic" icon="tag-outline">
      <LoadableGuard loadable={characteristicValueLoadable}>
        <List.Item title="Raw Value" description="Click to refresh" icon={characteristic.isNotifying ? "bell-ring" : "bell"} right={<RightContent value={rawValue} />} />
        <List.Item title="String" value={base64Value} />
        <List.Item title="Decimal" value={decimalValue} />
        <List.Item title="Hex" value={hexValue} />
        <List.Item title="Hex[]" value={hexArray} />
        <List.Item title="Decimal[]" value={decimalArray.join(':')} />
      </LoadableGuard>
    </List.Accordion>
  );
}

function WriteAccordion({ characteristic }: { characteristic?: any }) {

  const deviceId = useLocalSearchParams<{ deviceid: string }>().deviceid;
  const serviceId = useLocalSearchParams<{ serviceid: string }>().serviceid;
  const characteristicId = useLocalSearchParams<{ characteristicid: string }>().characteristicid;


  const description = characteristic ? "Click to write" : LOADING_TEXT;
  const icon = characteristic && characteristic.isNotifying ? "bell" : "bell";

  function RightContent() {
    return (
      <CharacteristicValueEditor deviceId={deviceId} serviceId={serviceId} characteristicId={characteristicId} />
    );
  }

  return (
    <List.Accordion title="Write" id="write" description="Write to the characteristic" icon="tag-edit-outline">
      <List.Item title="Value" description={description} icon={icon} editable={false} right={<RightContent />} />
    </List.Accordion>
  );
}

function NotifyAccordion({ characteristic }: { characteristic: Characteristic }) {
  const [isNotifyingLoadable, setIsNotifying] = useAtom(Bluetooth.characteristicIsNotifying({ deviceId: characteristic.deviceID, serviceUUID: characteristic.serviceUUID, characteristicUUID: characteristic.uuid }));
  const isNotifying = isNotifyingLoadable.state === 'hasData' ? isNotifyingLoadable.data : false;

  const [characteristicValueLoadable, refreshValue] = useAtom(Bluetooth.characteristicValue({ deviceId: characteristic.deviceID, serviceUUID: characteristic.serviceUUID, characteristicUUID: characteristic.uuid }));
  const characteristicValue = characteristicValueLoadable.state === 'hasData' ? characteristicValueLoadable.data : undefined;

  if (!characteristic?.isNotifiable) return null;

  function RightContent({ value }: { value: any }) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconButton icon={isNotifying ? "stop" : "play"} onPress={() => setIsNotifying(!isNotifying)} />
        <Text>{value}</Text>
      </View>
    );
  }


  return (
    <List.Accordion title="Notify" id="notify" description="Notify the characteristic" icon="bell-outline">
      <LoadableGuard loadable={isNotifyingLoadable}>
        <List.Item title="Notifications" description={isNotifying ? "Click to stop notifying" : "Click to notify"} icon={isNotifying ? "bell-ring" : "bell"} right={<RightContent value={characteristicValue} />} />
      </LoadableGuard>
    </List.Accordion>
  );
}

function DescriptorsAccordion({ characteristic }: { characteristic: Characteristic }) {
  const [descriptorsLoadable] = useAtom(Bluetooth.descriptors({ deviceId: characteristic.deviceID, serviceUUID: characteristic.serviceUUID, characteristicUUID: characteristic.uuid }));
  const descriptors = descriptorsLoadable.state === 'hasData' ? descriptorsLoadable.data : [];

  return (
    <List.Accordion id="descriptors" title="Descriptors" description="List of descriptors" icon="tag-multiple-outline"
      data={descriptors}
      keyExtractor={(item) => item.uuid || ''}
      renderItem={({ item }) => <List.Item title={item.uuid} description={item.uuid} value={item.value} icon="tag-multiple" />}
    />
  );
}


function AppBarActions({ deviceId, serviceUUID, characteristicUUID }: { deviceId: string, serviceUUID: string, characteristicUUID: string }) {
  return (
    <>
      <IsNotifyingAction deviceId={deviceId} serviceUUID={serviceUUID} characteristicUUID={characteristicUUID} />
    </>
  );
}


function ChacaracteristicViewPlaceholder() {
  return (
    <View style={{ alignItems: 'center', padding: 16 }}>
      <Text>Loading characteristic...</Text>
    </View>
  );
}

function CharacteristicView() {
  const { deviceid, serviceid, characteristicid } = useLocalSearchParams<{ deviceid: string, serviceid: string, characteristicid: string }>();
  const [characteristicLoadable] = useAtom(Bluetooth.characteristic({ deviceId: deviceid, serviceUUID: serviceid, characteristicUUID: characteristicid }));
  const characteristic = characteristicLoadable.state === 'hasData' ? characteristicLoadable.data : undefined;

  if (!characteristic) {
    return <ChacaracteristicViewPlaceholder />;
  }

  return (
    <ScrollView>
      <List.AccordionGroup>
        <InformationAccordion characteristic={characteristic} />
        <List.Maybe visible={characteristic.descriptors?.length > 0}>
          <DescriptorsAccordion characteristic={characteristic} />
        </List.Maybe>
        <List.Maybe visible={characteristic.isReadable}>
        <ReadAccordion characteristic={characteristic} />
        </List.Maybe>
        <List.Maybe visible={characteristic.isWritableWithResponse || characteristic.isWritableWithoutResponse}>
        <WriteAccordion characteristic={characteristic} />
        </List.Maybe>
          <List.Maybe visible={characteristic.isNotifiable}>
        <NotifyAccordion characteristic={characteristic} />
        </List.Maybe>
      </List.AccordionGroup>
    </ScrollView>
  );
}

export default function CharacteristicScreen() {
  const { deviceid, serviceid, characteristicid } = useLocalSearchParams<{ deviceid: string, serviceid: string, characteristicid: string }>();

  return (
    <ScreenLayout title="Characteristic" subtitle={characteristicid}
      actions={<AppBarActions deviceId={deviceid} serviceUUID={serviceid} characteristicUUID={characteristicid} />}
    >
      <CharacteristicView />
    </ScreenLayout>
  );
}
