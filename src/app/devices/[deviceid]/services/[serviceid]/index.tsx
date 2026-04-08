import { Bluetooth } from '@/services/ble/ble-service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { ScrollView } from 'react-native';

import { CharacteristicListItem } from '@/components/ble/characteristic-list-item';
import { DeviceListItem } from '@/components/ble/device-list-item';
import { List } from '@/components/list/list-item';
import { IsDeviceConnectedAction } from '@/components/ui/app-topbar';
import { LoadableGuard } from '@/components/ui/loadable';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Characteristic, Device, DeviceId, Service } from 'react-native-ble-plx';

const LOG_SRC = "ServiceScreen";

const LOADING_TEXT = 'Loading...';

function InformationAccordion({ deviceId, serviceId, service }: { deviceId: string, serviceId: string, service?: Service }) {
  const router = useRouter();
  const [deviceLoadable] = useAtom(Bluetooth.device({ deviceId }));
  const device = deviceLoadable.state === 'hasData' ? deviceLoadable.data : undefined;

  return (
    <List.Accordion title="Information" id="information" description="Information about the service" icon="information-outline">
      <LoadableGuard loadable={deviceLoadable}>
        <DeviceListItem device={device ? device : { id: deviceId } as Device} onDevicePress={() => router.navigate(`/devices/${deviceId}`)} />
      </LoadableGuard>
      <List.Item title="Is Primary" description="Indicates if this is the primary service" icon="star" value={service?.isPrimary || false} />
    </List.Accordion>
  );
}

function CharacteristicDataAccordion({ deviceId, serviceId }: { deviceId: string, serviceId: string }) {
  const [characteristicsLoadable] = useAtom(Bluetooth.characteristics({ deviceId, serviceUUID: serviceId }));
  const characteristics = characteristicsLoadable.state === 'hasData' ? characteristicsLoadable.data : undefined;
  const router = useRouter();

  const onCharacteristicPress = (characteristic: Characteristic) => {
    router.navigate({
      pathname: `/devices/[deviceid]/services/[serviceid]/characteristics/[characteristicid]`,
      params: { deviceid: deviceId, serviceid: serviceId, characteristicid: characteristic?.uuid }
    });
  };

  return (
    <List.Accordion id="characteristics" title="Characteristics" description="List of characteristics for this service" icon="tag-multiple-outline"
      data={characteristics}
      keyExtractor={(item) => item.uuid || item.id}
      renderItem={({ item }) => <CharacteristicListItem characteristic={item} onCharacteristicPress={onCharacteristicPress} />}
    />
  );
}

function AppBarActions({ deviceId, children }: { deviceId: DeviceId, children?: React.ReactNode }) {
  return (
    <>
      <IsDeviceConnectedAction deviceId={deviceId} />
    </>
  );
}


export default function ServiceScreen() {
  const { deviceid, serviceid } = useLocalSearchParams<{ deviceid: string, serviceid: string }>();

  const [serviceLoadable] = useAtom(Bluetooth.service({ deviceId: deviceid, serviceUUID: serviceid }));
  const service = serviceLoadable.state === 'hasData' ? serviceLoadable.data : undefined;

  return (
    <ScreenLayout
      title="Service"
      subtitle={service?.uuid || LOADING_TEXT}
      actions={<AppBarActions deviceId={deviceid} />}
    >
      <ScrollView>
        <List.AccordionGroup>
          <InformationAccordion deviceId={deviceid} serviceId={serviceid} service={service} />
          <CharacteristicDataAccordion deviceId={deviceid} serviceId={serviceid} />
        </List.AccordionGroup>
      </ScrollView>
    </ScreenLayout>
  );
}
