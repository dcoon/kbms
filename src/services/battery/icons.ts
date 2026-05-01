import { DefaultTheme, ThemeType } from "@/theme/theme";
import { useTheme } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";
import { BatterySoCLevel, CellDeltaVLevel, CellVoltageLevel, LastSeenStatus } from "./battery";


export function socIconSource({ soc, charging = false, theme = DefaultTheme }: { soc?: number; charging?: boolean; theme?: typeof DefaultTheme; }) : IconSource {

  const icons = charging ? theme.icons.battery.soc.charging : theme.icons.battery.soc;

  if (soc === undefined || soc === null) {
    return { source: icons.unknown.source, color: theme.colors.onSurface, size: theme.icons.iconSize } as IconSource;
  } else if (soc >= BatterySoCLevel.High) {
    return { source: icons.high.source, color: icons.high.color, size: theme.icons.iconSize } as IconSource;
  } else if (soc >= BatterySoCLevel.Medium) {
    return { source: icons.medium.source, color: icons.medium.color, size: theme.icons.iconSize } as IconSource;
  } else if (soc >= BatterySoCLevel.Low) {
    return { source: icons.low.source, color: icons.low.color, size: theme.icons.iconSize } as IconSource;
  } else {
    return { source: icons.alert.source, color: icons.alert.color, size: theme.icons.iconSize } as IconSource;
  }

}export function batteryLastSeenIconSource(now: number, lastUpdated?: Date, theme: ThemeType = DefaultTheme): IconSource {

    if (lastUpdated === undefined || lastUpdated === null) {
        return theme.icons.battery.lastSeen.unknown as IconSource; // never seen
    } else {
        const msSinceLastUpdate = now - lastUpdated.getTime();
        const secondsSinceLastUpdate = msSinceLastUpdate / 1000;

        if (secondsSinceLastUpdate <= LastSeenStatus.Recent) {
            return theme.icons.battery.lastSeen.recent as IconSource;
        } else if (secondsSinceLastUpdate <= LastSeenStatus.Moderate) {
            return theme.icons.battery.lastSeen.moderate as IconSource;
        } else if (secondsSinceLastUpdate <= LastSeenStatus.Old) {
            return theme.icons.battery.lastSeen.old as IconSource;
        } else {
            return theme.icons.battery.lastSeen.never as IconSource;
        }

    }

}
export function cellVoltageIconSource({ cellv, theme = DefaultTheme }: { cellv?: number; theme?: typeof DefaultTheme; }): IconSource {

    const icons = theme.icons.battery.soc;

    if (cellv === undefined) {
        return { source: icons.unknown.source, color: theme.colors.onSurface, size: theme.icons.iconSize } as IconSource;
        // } else if (cellv >= CellVoltageLevel.VeryHigh) {
        //   return {source: icons.high.source, color: "green"};
    } else if (cellv >= CellVoltageLevel.High) {
        return { source: icons.high.source, color: icons.high.color, size: theme.icons.iconSize } as IconSource;
    } else if (cellv >= CellVoltageLevel.Medium) {
        return { source: icons.medium.source, color: icons.medium.color, size: theme.icons.iconSize } as IconSource;
        // } else if (cellv >= CellVoltageLevel.Low) {
        //   return {source: icons.low.source, color: icons.low.color};
    } else if (cellv >= CellVoltageLevel.VeryLow) {
        return { source: icons.low.source, color: icons.low.color, size: theme.icons.iconSize } as IconSource;
    } else {
        return { source: icons.empty.source, color: icons.empty.color, size: theme.icons.iconSize } as IconSource;
    }


}
export function cellDeltaVIconSource({ deltav }: { deltav?: number; }) : IconSource {

    const theme = useTheme() as typeof DefaultTheme;
    const icons = theme.icons.battery.deltaV;
    if (deltav === undefined || deltav === null || isNaN(deltav)) {
        return { source: icons.unknown.source, color: icons.unknown.color, size: theme.icons.iconSize } as IconSource;
        // } else if (deltav >= CellDeltaVLevel.VeryHigh) {
        //   return {source: icons.high.source, color: icons.high.color, size: theme.icons.iconSize};
    } else if (deltav >= CellDeltaVLevel.High) {
        return { source: icons.high.source, color: icons.high.color, size: theme.icons.iconSize } as IconSource;
    } else if (deltav >= CellDeltaVLevel.Medium) {
        return { source: icons.medium.source, color: icons.medium.color, size: theme.icons.iconSize } as IconSource;
        // } else if (deltav >= CellDeltaVLevel.Low) {
        //   return {source: icons.low.source, color: icons.low.color, size: theme.icons.iconSize};
    } else {
        return { source: icons.low.source, color: icons.low.color, size: theme.icons.iconSize } as IconSource;
    }

}

