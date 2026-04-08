import { DeviceId, getDeviceName, LoadableState } from '@/services/ble/ble-types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Device, Service } from 'react-native-ble-plx';

import React from 'react';
import { ScrollView } from 'react-native';

import { List } from '@/components/list/list-item';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Bluetooth } from '@/services/ble/ble-service';
import { useAtom } from 'jotai';

import { DeviceListItem } from '@/components/ble/device-list-item';
import { ServiceListItem } from '@/components/ble/service-list-item';

import { BatteryAction, IsDeviceConnectedAction } from '@/components/ui/app-topbar';
import { LoadableGuard } from '@/components/ui/loadable';
import { uilog as log } from '@/services/log/log-service';


const LOG_SRC = "DeviceScreen";



function InformationAccordion({ device, children }: { device: Device, children?: React.ReactNode }) {

  const LOG_PREFIX = LOG_SRC + ": InformationAccordion";

  log.debug(LOG_PREFIX, "called with device: ", device.id);

  return (
    <List.Accordion title="Information" id="information" description="Information about the device" icon="information-outline">
      <DeviceListItem device={device} />
      <List.Item title="Local Name" description="Local name of the device" icon="information-outline" value={device?.localName} />

      <List.Item title="MTU" description="Maximum Transmission Unit" icon="information-outline" value={device?.mtu} />
      <List.Item title="TX" description="Transmission Power" icon="information-outline" value={device?.txPowerLevel} />
      <List.Item title="Manufacturer Data" description="Manufacturer specific data" icon="information-outline" value={device?.manufacturerData} />
      {children}
    </List.Accordion>
  );
}

function AppBarActions({ deviceId, children }: { deviceId: DeviceId, children?: React.ReactNode }) {
  return (
    <>

      <BatteryAction deviceId={deviceId} />
      <IsDeviceConnectedAction deviceId={deviceId} />
      {children}
    </>
  );
}


function ServicesAccordion({ device, onServicePress, children }: { device: Device, onServicePress?: (service: Service) => void, children?: React.ReactNode }) {

  const LOG_PREFIX = LOG_SRC + ": ServicesAccordion";

  log.debug(LOG_PREFIX, "called with device: ", device.id);

  const [servicesLoadable] = useAtom(Bluetooth.services(device.id));
  const services = servicesLoadable.state === LoadableState.hasData ? servicesLoadable.data : [];

  return (
    <LoadableGuard loadable={servicesLoadable}>
      <List.Accordion title="Services" id="services" description="List of services provided by the device" icon="wrench-outline" data={services}
        keyExtractor={(item) => item.uuid || ''}
        renderItem={({ item }) => <ServiceListItem service={item} onServicePress={onServicePress} />}
      />
    </LoadableGuard>
  );
}

function DeviceView({ device }: { device: Device }) {

  const router = useRouter();

  const serviceData = Object.entries(device?.serviceData || {}).map(([key, value]) => ({ key: key, value: value }));

  const onServicePress = (service: Service) => {


    const LOG_PREFIX = LOG_SRC + ": onServicePress";
    log.debug(LOG_PREFIX, ": onServicePress called with service: ", service.deviceID, service.uuid);

    // router.navigate(`/devices/${device?.id}/services/${service.uuid}`);
    router.navigate(
      {
        pathname: "/devices/[deviceid]/services/[serviceid]",
        params: {
          deviceid: service.deviceID,
          serviceid: service.uuid
        }
      }
    )
  }


  return (
    <ScrollView>
      <List.AccordionGroup>
        <InformationAccordion device={device} />
        <ServicesAccordion device={device} onServicePress={onServicePress} />
        <List.Accordion id="service-uuids" title="Service UUIDs" description="List of service UUIDs" icon="shape-oval-plus" data={device?.serviceUUIDs || undefined} />
        <List.Accordion id="solicited-service-uuids" title="Solicited Services" description="List of solicited service UUIDs" icon="shape-oval-plus" data={device?.solicitedServiceUUIDs || undefined} />
        <List.Accordion id="overflow-service-uuids" title="Overflow Services" description="List of overflow service UUIDs" icon="shape-oval-plus" data={device?.overflowServiceUUIDs || undefined} />

        <List.Accordion id="service-data" title="Service Data" description="Service data key-value pairs"
          icon="shape-oval-plus" data={serviceData}
        />



      </List.AccordionGroup>
    </ScrollView>
  );
}


export default function DeviceScreen() {


  const { deviceid } = useLocalSearchParams<{ deviceid: string }>();
  const [deviceLoadable] = useAtom(Bluetooth.device({ deviceId: deviceid }));
  const device = deviceLoadable.state === LoadableState.hasData ? deviceLoadable.data : undefined;

  const LOG_PREFIX = LOG_SRC + ": DeviceScreen";

  log.debug(LOG_PREFIX, "rendering DeviceScreen", deviceid);

  return (
    <ScreenLayout
      title={getDeviceName(device)}
      actions={<AppBarActions deviceId={deviceid} />}
    >
      <LoadableGuard loadable={deviceLoadable}  >
        <DeviceView device={device ? device : { id: deviceid } as Device} />
      </LoadableGuard>
    </ScreenLayout>
  );
}

