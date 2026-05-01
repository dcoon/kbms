import { getDeviceName } from '@/services/ble/ble';
import { LoadableState } from '@/util/util';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Device } from 'react-native-ble-plx';

import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';

import { LastSeenListItem, List } from '@/components/list/list-item';
import { ScreenLayout } from '@/components/ui/screen-layout';
import * as Bluetooth from '@/services/ble/ble-service';
import { useAtom } from 'jotai';


import { FavoriteAction, IsBatteryConnectedAction } from '@/components/ui/topbar-actions';
import { uilog as log } from '@/services/log/log-service';

import { battery as batteryAtom, isBatteryConnected } from '@/services/battery/battery-service';

import { BatteryCardLarge } from "@/components/battery/battery-card-large";
import { BatteryDeltaVIcon, BatteryStatusIcon, CellVoltageIcon } from '@/components/battery/icons';

const LOG_SRC = "BatteryScreen";



function BatteryDataAccordion({ device, children }: { device: Device, children?: React.ReactNode }) {

  const [battery] = useAtom(batteryAtom(device.id));

  return (
    <List.Accordion title="Battery Data" id="battery-data" description="Current battery status" icon="car-battery">

      {/* <List.Item title="SoC" description="State of Charge (SOC) %" icon="battery-high" value={battery?.soc} /> */}
      <List.Item title="Voltage" description="Voltage Vdc" icon="flash-triangle-outline" value={battery ? battery?.voltage / 1000 + " V" : ""} />


      <List.Item
        title="Current"
        description="Current A"
        value={battery ? battery?.current / 1000 + " A" : ""}
        icon="current-dc"
      />
      <List.Item
        title="Temperature"
        description="Temperature °C"
        value={battery ? battery?.temperature / 100 + " °C" : ""}
        icon="thermometer"
      />
      <List.Item
        title="Cycles"
        description="Number of cycles"
        value={battery?.cycles}
        icon="chart-donut"
      />
      <List.Item
        title="Capacity"
        description="Capacity Ah"
        value={battery ? battery?.capacity / 1000 + " Ah" : ""}
        icon="car-battery"
      />

      <List.Item
        title="Status"
        // description="HV: High Voltage, LV: Low Voltage, OCC: Over Current Charge, OCD: Over Current Discharge, LTD: Long Term Disable, LTC: Long Term Charge, HTD: High Temperature Disable, HTC: High Temperature Charge"
        icon="alert-outline"
        right={<BatteryStatusIcon status={battery?.status} showNoFlags={true} />}
      />


      <LastSeenListItem lastUpdated={battery?.lastUpdated} />



      {children}
    </List.Accordion>
  );
}

function InformationAccordion({ device }: { device: Device }) {

  const [battery] = useAtom(batteryAtom(device ? device.id : ""));
  const [rssiLoadable] = useAtom(Bluetooth.rssi(device.id));
  const rssi = rssiLoadable.state === "hasData" ? rssiLoadable.data : device.rssi;

  return (
    <List.Accordion
      id="battery-information"
      title="General Information"
      description="Information about the battery"
      icon="car-battery"
    >
      <List.Item
        title="Name"
        description="Name of the battery"
        value={device?.name}
        icon="information-outline"
      />
      <List.Item
        title="Local Name"
        description="Local Name of the battery"
        value={device?.localName}
        icon="information-outline"
      />
      <List.Item
        title="ID"
        description="Device ID of the battery"
        value={device?.id}
        icon="information-outline"
      />
      <List.Item
        title="Signal"
        description="Signal Strength dBm"
        value={rssi}
        icon="signal-cellular-outline"
      />
      <List.Item
        title="Model"
        description='Battery model name'
        value={battery?.batteryTypeName}
        icon="identifier"
      />
      <List.Item
        title="Info Status"
        description="Still not sure what this is but it's always 0"
        value={battery?.infoStatus}
        icon="identifier"
      />
      <List.Item
        title="AFE Status"
        description='Analog Front End Status'
        value={battery?.afeStatus}
        icon="identifier"
      />




    </List.Accordion>

  );

}

function CellDataAccordionRight({ deltav }: { deltav?: number }) {

  return (
      <BatteryDeltaVIcon deltav={deltav} />
  );

}


function CellDataAccordion({ device }: { device: Device }) {

  const [battery] = useAtom(batteryAtom(device.id));
  const cells = battery?.cells ? battery.cells : [];

  const cellMax = cells.reduce((max, cell) => {
    return cell.voltage > max ? cell.voltage : max;
  }, 0);

  const cellMin = cells.reduce((min, cell) => {
    return cell.voltage < min ? cell.voltage : min;
  }, cells[0] ? cells[0].voltage : 0);

  const deltav = cellMax - cellMin;

  return (
    <List.Accordion
      title="Cell Data" id="cell-data" description="Cell Data" icon="information-outline"
      right={<CellDataAccordionRight deltav={deltav} />}
    >
      <List.StaticList
        data={cells}
        keyExtractor={(item) => String(item) + Math.random()} // Use a unique key extractor for each item 
        renderItem={({ item, index }) => (
          <List.Item
            title={`Cell ${index + 1}`}
            value={item.voltage ? (item.voltage / 1000).toFixed(2) + "V" : "Unknown"}
            left={<CellVoltageIcon cellv={item.voltage} />}
          />
        )}
      />

    </List.Accordion>
  );
}

function SettingsAccordion({ device }: { device: Device }) {
  return (
    <List.Accordion title="Settings" id="settings" description="Battery settings" icon="information-outline">
      <List.Item title="Storage" description="Current storage mode" icon="sleep" editable={true} value={false} />
      <List.Item title="PlusNET" description="Current PlusNET mode" icon="plus-network-outline" editable={true} value={false} />

    </List.Accordion>
  );
}

function AppBarActions({ device }: { device?: Device }) {

  return (
    <>
      <FavoriteAction device={device} />
      <IsBatteryConnectedAction device={device} />
    </>

  );
}


function StartStopBatteryConnectedOnFocus({ deviceId }: { deviceId: string }) {

  const [, setIsBatteryConnected] = useAtom(isBatteryConnected(deviceId));

  useFocusEffect(
    useCallback(() => {
      const LOG_PREFIX = LOG_SRC + ": StartStopBatteryConnectedOnFocus";
      log.info(LOG_PREFIX, "focus effect called, starting scan");
      setIsBatteryConnected(true);
      return () => {
        log.info(LOG_PREFIX, "focus effect cleanup called, but not disconnecting from battery");
        // setIsBatteryConnected(false);
      };
    }, [])
  );
  return null;
}

function BatteryView({ device }: { device: Device }) {

  const [battery] = useAtom(batteryAtom(device.id));

  return (
    <ScrollView>
      <StartStopBatteryConnectedOnFocus deviceId={device.id} />
      <BatteryCardLarge battery={battery} />
      <List.AccordionGroup>
        <BatteryDataAccordion device={device} />
        <CellDataAccordion device={device} />
        <InformationAccordion device={device} />
        <SettingsAccordion device={device} />
      </List.AccordionGroup>
    </ScrollView>
  );
}

export default function BatteryScreen() {

  const LOG_PREFIX = LOG_SRC + ": BatteryScreen";


  const { deviceid } = useLocalSearchParams<{ deviceid: string }>();
  const [deviceLoadable] = useAtom(Bluetooth.connectedDevice(deviceid));
  const device = deviceLoadable.state === LoadableState.hasData ? deviceLoadable.data : undefined;
  const name = getDeviceName(device);

  log.debug(LOG_PREFIX, "Rendering...", deviceid);

  return (
    <ScreenLayout
      title={name}
      // subtitle="Battery"
      actions={<AppBarActions device={device} />}
    >
      <BatteryView device={device ? device : { id: deviceid } as Device} />
    </ScreenLayout>
  );
}

