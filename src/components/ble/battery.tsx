import { BatterySoCLevel, BatteryStatus, CellDeltaVLevel, CellVoltageLevel } from "@/services/ble/battery";
import { LightTheme } from "@/theme/theme";
import React from "react";
import { View } from "react-native";
import { Chip, Icon, useTheme } from "react-native-paper";
import { DEFAULT_ICON_SIZE } from "../ui/ui-util";



export function socIconSource({ soc, charging = false, theme = LightTheme }: { soc?: number, charging?: boolean, theme?: typeof LightTheme }) {
  
  const icons = charging ? theme.icons.battery.charging : theme.icons.battery;

  if (soc === undefined || soc === null) {
    return {source: icons.unknown.source, color: theme.colors.onSurface, size: theme.icons.iconSize};
  } else if (soc >= BatterySoCLevel.VeryHigh) {
    return {source: icons.high.source, color: icons.high.color, size: theme.icons.iconSize};
  } else if (soc >= BatterySoCLevel.High) {
    return {source: icons.medium.source, color: icons.medium.color, size: theme.icons.iconSize};
  } else if (soc >= BatterySoCLevel.Medium) {
    return {source: icons.low.source, color: icons.low.color, size: theme.icons.iconSize};
  } else if (soc >= BatterySoCLevel.Low) {
    return {source: icons.empty.source, color: icons.empty.color, size: theme.icons.iconSize};
  } else {
    return {source: icons.alert.source, color: icons.alert.color, size: theme.icons.iconSize};
  }

}

export function SoCIcon({ soc, charging = false }: { soc?: number, charging?: boolean }) {

  const theme = useTheme() as typeof LightTheme;
  const icon = socIconSource({ soc, charging, theme });

  return <Icon source={icon.source} color={icon.color} size={icon.size} />;

}

export function CellVoltageIconSource({ cellv, theme = LightTheme }: { cellv?: number, theme?: typeof LightTheme }) {

    const icons = theme.icons.battery;

    if (cellv === undefined) {
    return {source: icons.unknown.source, color: theme.colors.onSurface, size: theme.icons.iconSize};
  // } else if (cellv >= CellVoltageLevel.VeryHigh) {
  //   return {source: icons.high.source, color: "green"};
  } else if (cellv >= CellVoltageLevel.High) {
    return {source: icons.high.source, color: icons.high.color, size: theme.icons.iconSize};
  } else if (cellv >= CellVoltageLevel.Medium) {
    return {source: icons.medium.source, color: icons.medium.color, size: theme.icons.iconSize};
  // } else if (cellv >= CellVoltageLevel.Low) {
  //   return {source: icons.low.source, color: icons.low.color};
  } else if (cellv >= CellVoltageLevel.VeryLow) {
    return {source: icons.low.source, color: icons.low.color, size: theme.icons.iconSize};
  } else {
    return {source: icons.empty.source, color: icons.empty.color, size: theme.icons.iconSize};
  }


}

export function CellVoltageIcon({ cellv }: { cellv?: number }) {


  const theme = useTheme() as typeof LightTheme;

  const icon = CellVoltageIconSource({ cellv, theme });

  return <Icon source={icon.source} color={icon.color} size={icon.size} />;
}


export function CellDeltaVIconSource({ deltav }: { deltav?: number }) {

  const theme = useTheme() as typeof LightTheme;
  const icons = theme.icons.deltaV;
  if (deltav === undefined) {
    return {source: icons.unknown.source, color: icons.unknown.color, size: theme.icons.iconSize};
  // } else if (deltav >= CellDeltaVLevel.VeryHigh) {
  //   return {source: icons.high.source, color: icons.high.color, size: theme.icons.iconSize};
  } else if (deltav >= CellDeltaVLevel.High) {
    return {source: icons.high.source, color: icons.high.color, size: theme.icons.iconSize};
  } else if (deltav >= CellDeltaVLevel.Medium) {
    return {source: icons.medium.source, color: icons.medium.color, size: theme.icons.iconSize};
  // } else if (deltav >= CellDeltaVLevel.Low) {
  //   return {source: icons.low.source, color: icons.low.color, size: theme.icons.iconSize};
  } else {
    return {source: icons.low.source, color: icons.low.color, size: theme.icons.iconSize};
  }

}


export function IconForCellDeltaV({ deltav, size = DEFAULT_ICON_SIZE }: { deltav?: number; size?: number; }) {

  const icon = CellDeltaVIconSource({ deltav });

  return <Icon source={icon.source} color={icon.color} size={size} />;
}

export function BatteryStatusFlags({ status, showNoFlags = true }: { status: BatteryStatus | undefined, showNoFlags?: boolean }) {

  const theme = useTheme() as typeof LightTheme;

  if (status === undefined) {
    return null;
  }

  const style = {
    color: theme.colors.error,
    fontWeight: "bold" as const,
    marginRight: 2,
  };

  const styleOK = {
    ...style,
    color: theme.colors.ok,
  };



  const icon = theme.icons.battery.alert;
  const flags = ["HV", "LV", "OCC", "OCD", "LTD", "LTC", "HTD", "HTC"] as const;

  function ActiveFlag({ flag, s = style }: { flag: string, s: typeof style }) {
    return (
      <Chip key={flag} selectedColor={s.color} icon={() => (<Icon source={icon.source} color={icon.color} size={theme.icons.iconSize} />)} mode="outlined" style={{ alignSelf: 'center', margin: 6, }} compact={true}>{flag}</Chip>
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
