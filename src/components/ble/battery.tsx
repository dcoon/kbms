import { BatterySoCLevel, CellDeltaVLevel, CellVoltageLevel } from "@/services/ble/battery";
import React from "react";
import { Icon } from "react-native-paper";
import { DEFAULT_ICON_SIZE } from "../ui/ui-util";


export function IconForSoC({ soc, size = DEFAULT_ICON_SIZE, current = 0 }: { soc?: number, size?: number, current?: number }) {


  if (current > 0) {
    if (soc === undefined || soc === null) {
      return (<Icon source="battery-unknown" size={size} />);
    } else if (soc >= BatterySoCLevel.VeryHigh) {
      return (<Icon source="battery-charging-high" color="green" size={size} />);
    } else if (soc >= BatterySoCLevel.High) {
      return (<Icon source="battery-charging-medium" color="orange" size={size} />);
    } else if (soc >= BatterySoCLevel.Medium) {
      return (<Icon source="battery-charging-low" color="orange" size={size} />);
    } else if (soc >= BatterySoCLevel.Low) {
      return (<Icon source="battery-charging-outline" color="red" size={size} />);
    } else {
      return (<Icon source="battery-alert" color="red" size={size} />);
    }

  }



  if (soc === undefined || soc === null) {
    return (<Icon source="battery-unknown" size={size} />);
  } else if (soc >= BatterySoCLevel.VeryHigh) {
    return (<Icon source="battery-high" color="green" size={size} />);
  } else if (soc >= BatterySoCLevel.High) {
    return (<Icon source="battery-medium" color="orange" size={size} />);
  } else if (soc >= BatterySoCLevel.Medium) {
    return (<Icon source="battery-low" color="orange" size={size} />);
  } else if (soc >= BatterySoCLevel.Low) {
    return (<Icon source="battery-outline" color="red" size={size} />);
  } else {
    return (<Icon source="battery-alert" color="red" size={size} />);
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

