import { BatterySoCLevel, BatteryStatus, CellDeltaVLevel, CellVoltageLevel } from "@/services/ble/battery";
import React from "react";
import { View } from "react-native";
import { Chip, Icon } from "react-native-paper";
import { DEFAULT_ICON_SIZE } from "../ui/ui-util";

export function colorForSoc(soc?: number): string {

  if (soc === undefined || soc === null) {
    return "gray";
  } else if (soc >= BatterySoCLevel.VeryHigh) {
    return "green";
  } else if (soc >= BatterySoCLevel.High) {
    return "green";
  } else if (soc >= BatterySoCLevel.Medium) {
    return "orange";
  } else if (soc >= BatterySoCLevel.Low) {
    return "orange";
  } else {
    return "red";
  }

}

export function SoCIcon({ soc, size = DEFAULT_ICON_SIZE, current = 0 }: { soc?: number, size?: number, current?: number }) {


  if (current < 0) {
    if (soc === undefined || soc === null) {
      return (<Icon source="battery-unknown" size={size} />);
    } else if (soc >= BatterySoCLevel.VeryHigh) {
      return (<Icon source="battery-charging-high" color={colorForSoc(soc)} size={size} />);
    } else if (soc >= BatterySoCLevel.High) {
      return (<Icon source="battery-charging-medium" color={colorForSoc(soc)} size={size} />);
    } else if (soc >= BatterySoCLevel.Medium) {
      return (<Icon source="battery-charging-low" color={colorForSoc(soc)} size={size} />);
    } else if (soc >= BatterySoCLevel.Low) {
      return (<Icon source="battery-charging-outline" color={colorForSoc(soc)} size={size} />);
    } else {
      return (<Icon source="battery-alert" color={colorForSoc(soc)} size={size} />);
    }

  }



  if (soc === undefined || soc === null) {
    return (<Icon source="battery-unknown" size={size} />);
  } else if (soc >= BatterySoCLevel.VeryHigh) {
    return (<Icon source="battery-high" color={colorForSoc(soc)} size={size} />);
  } else if (soc >= BatterySoCLevel.High) {
    return (<Icon source="battery-medium" color={colorForSoc(soc)} size={size} />);
  } else if (soc >= BatterySoCLevel.Medium) {
    return (<Icon source="battery-low" color={colorForSoc(soc)} size={size} />);
  } else if (soc >= BatterySoCLevel.Low) {
    return (<Icon source="battery-outline" color={colorForSoc(soc)} size={size} />);
  } else {
    return (<Icon source="battery-alert" color={colorForSoc(soc)} size={size} />);
  }

}



export function IconForCellVoltage({ cellv, iconSize = DEFAULT_ICON_SIZE }: { cellv?: number, iconSize?: number }) {


  if (cellv === undefined) {
    return <Icon source="battery-unknown" size={iconSize} />;
  } else if (cellv >= CellVoltageLevel.VeryHigh) {
    return <Icon source="battery-alert" color="red" size={iconSize} />;
  } else if (cellv >= CellVoltageLevel.High) {
    return <Icon source="battery-high" color="green" size={iconSize} />;
  } else if (cellv >= CellVoltageLevel.Medium) {
    return <Icon source="battery-medium" color="orange" size={iconSize} />;
  } else if (cellv >= CellVoltageLevel.Low) {
    return <Icon source="battery-low" color="red" size={iconSize} />;
  } else if (cellv >= CellVoltageLevel.VeryLow) {
    return <Icon source="battery-outline" color="red" size={iconSize} />;
  } else {
    return <Icon source="battery-0" size={iconSize} />;
  }
}


export function IconForCellDeltaV({ deltav, size = DEFAULT_ICON_SIZE }: { deltav?: number; size?: number; }) {

  if (deltav === undefined) {
    return <Icon source="delta" size={size} />;
  } else if (deltav >= CellDeltaVLevel.VeryHigh) {
    return <Icon source="delta" color="red" size={size} />;
  } else if (deltav >= CellDeltaVLevel.High) {
    return <Icon source="delta" color="orange" size={size} />;
  } else if (deltav >= CellDeltaVLevel.Medium) {
    return <Icon source="delta" color="orange" size={size} />;
  } else if (deltav >= CellDeltaVLevel.Low) {
    return <Icon source="delta" color="green" size={size} />;
  } else {
    return <Icon source="delta" color="green" size={size} />;
  }
}

export function BatteryStatusFlags({ status, showNoFlags = true }: { status: BatteryStatus | undefined, showNoFlags?: boolean }) {

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
      <Chip key={flag} selectedColor={s.color} icon={() => (<Icon source='alert' color={s.color} size={14} />)} mode="outlined" style={{ alignSelf: 'center', margin: 6, }} compact={true}>{flag}</Chip>
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
