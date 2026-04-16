import { getDeviceName, LoadableState } from '@/services/ble/ble-types';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Device } from 'react-native-ble-plx';

import React, { useCallback } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';

import { LastSeenListItem, List } from '@/components/list/list-item';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Bluetooth } from '@/services/ble/ble-service';
import { BatteryStatus, KV_BATTERY_NOTIFY_UUID, KV_BATTERY_SERVICE_UUID } from '@/services/manufacturers/smarrtpower/SmartPowerMessageUtil';
import { useAtom } from 'jotai';

import { formatDistanceToNow } from 'date-fns';

import { FavoriteAction, IsNotifyingAction } from '@/components/ui/app-topbar';
import { uilog as log } from '@/services/log/log-service';
import { Card, Chip, Icon, Text } from 'react-native-paper';

import { battery as batteryAtom, isBatteryConnected } from '@/services/ble/battery-service';

import { IconForCellDeltaV, IconForCellVoltage, IconForSoC } from '@/components/ble/battery';
import { Gauge } from '@/components/ui/gauge';

const LOG_SRC = "BatteryScreen";


function BatteryGraph({ device }: { device: Device }) {
  const [battery] = useAtom(batteryAtom(device ? device.id : ""));

  const soc = battery ? battery.soc : undefined;
  const voltage = battery ? battery.voltage / 1000 : 0;
  const current = battery ? battery.current : 0;
  const temperature = battery ? battery.temperature / 100 : 0;
  const status = battery ? battery.rawStatus : "";
  const cycles = battery ? battery.cycles : 0;
  const lastSeen = battery?.lastUpdated ? formatDistanceToNow(battery.lastUpdated, { addSuffix: true }) : "Unknown";


  const subtitle = `${voltage}V / ${current}A`;


  const MAX_VOLTAGE = 15;
  const MAX_CURRENT = 100;
  const { width, height } = useWindowDimensions();
  const radius = width * 0.3;
  const thickness = radius * 0.08;


  return (
    <Card>
      <Card.Title title="State of Charge" left={(props) => <IconForSoC soc={soc} current={current} size={props.size} />} />
      <Card.Content>
        <View style={{ flexDirection: 'column', }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }} >
            <Gauge
              value={soc}
              maxvalue={100}
              valuesuffix='%'
              radius={radius}
              thickness={thickness}
              title="SoC" />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <BatteryStatusFlags status={battery?.status} showNoFlags={false} />
            <Chip icon="clock-outline" mode="outlined" style={{ alignSelf: 'center', margin: 6, }}>{lastSeen}</Chip>
          </View>
        </View>
      </Card.Content>
    </Card>

  );
}

function BatteryStatusFlags({ status, showNoFlags = true }: { status: BatteryStatus | undefined, showNoFlags?: boolean }) {

  if (status === undefined) {
    return null;
  }

  const style = {
    color: "red",
    fontWeight: "bold" as const,
    marginRight: 2,
  };

  const styleOK = {
    ...style,
    color: "green",
  };

  const flags = ["HV", "LV", "OCC", "OCD", "LTD", "LTC", "HTD", "HTC"] as const;

  function ActiveFlag({ flag, s = style }: { flag: string, s: typeof style }) {
    return (
      <Chip key={flag} selectedColor={s.color} icon={() => (<Icon source='alert' color={s.color} size={14} />)} mode="outlined" style={{ alignSelf: 'center', margin: 6, }}>{flag}</Chip>
    );
  }
  function ActiveFlags({ status, showNoFlags }: { status: BatteryStatus, showNoFlags?: boolean }) {

    const activeFlags = flags.filter(flag => status[flag]);

    if (activeFlags.length === 0) {
      return showNoFlags ? (<ActiveFlag flag="OK" s={styleOK} />) : null;
    }

    return (
      <View style={{ flexDirection: 'row', }}>
        {activeFlags.map(flag => (
          <ActiveFlag key={flag} flag={flag} s={style} />
        ))}
      </View>
    );


  }

  return (
    <View style={{ flexDirection: 'row', }}>
      <ActiveFlags status={status} showNoFlags={showNoFlags} />
    </View>
  );

}
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
        description="HV: High Voltage, LV: Low Voltage, OCC: Over Current Charge, OCD: Over Current Discharge, LTD: Long Term Disable, LTC: Long Term Charge, HTD: High Temperature Disable, HTC: High Temperature Charge"
        icon="alert-outline"
        right={<BatteryStatusFlags status={battery?.status} />}
      />


      <LastSeenListItem lastUpdated={battery?.lastUpdated} />



      {children}
    </List.Accordion>
  );
}

function InformationAccordion({ device }: { device: Device }) {

  const [battery] = useAtom(batteryAtom(device ? device.id : ""));

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
        title="Signal"
        description="Signal Strength dBm"
        value={device?.rssi}
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
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <IconForCellDeltaV deltav={deltav} size={16} />
      <Text variant="bodySmall">{deltav ? deltav + "mV" : "Unknown"}</Text>
    </View>
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
            value={item.voltage ? (item.voltage / 1000).toFixed(3) + "V" : "Unknown"}
            left={IconForCellVoltage({ cellv: item.voltage  })}
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

  if (!device) {
    return null;
  }

  return (
    <>
      <FavoriteAction deviceId={device.id} name={device.name || ""} />
      <IsNotifyingAction deviceId={device.id} serviceUUID={KV_BATTERY_SERVICE_UUID} characteristicUUID={KV_BATTERY_NOTIFY_UUID} />
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
        log.info(LOG_PREFIX, "cleanup function called, stopping scan");
        setIsBatteryConnected(false);
      };
    }, [])
  );
  return null;
}

function BatteryView({ device }: { device: Device }) {


  return (
    <ScrollView>
      <StartStopBatteryConnectedOnFocus deviceId={device.id} />
      <BatteryGraph device={device} />
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

