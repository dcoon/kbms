import { DefaultTheme, ThemeType } from "@/theme/theme";
import { State } from "react-native-ble-plx";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";
import { RssiLevel } from "./ble";


export function ScanningStateIconSource(isScanning: boolean, theme: ThemeType = DefaultTheme): IconSource {

    if (isScanning) {
        return theme.icons.scanning.stop as IconSource;
    } else {
        return theme.icons.scanning.refresh as IconSource;
    }
}


export function rssiIconSource(rssi?: number | null, theme: ThemeType = DefaultTheme): IconSource {


    if (rssi === undefined || rssi === null) {
        return { source: "signal-off", color: "black" } as IconSource; //"signal-cellular-off"; // no signal
    } else if (rssi >= RssiLevel.Strong) {
        return { source: "signal-cellular-3", color: "green" } as IconSource; // 4 bars
    } else if (rssi >= RssiLevel.Moderate) {
        return { source: "signal-cellular-2", color: "orange" } as IconSource; // 3 bars                
    } else if (rssi >= RssiLevel.Weak) {
        return { source: "signal-cellular-1", color: "red" } as IconSource; // 2 bars           
    } else {
        return { source: "signal-cellular-outline", color: "red" } as IconSource; // no signal    
    }

}


export function BluetoothStateIconSource(state: State) {

    switch (state) {
        case State.PoweredOn:
            return 'bluetooth';
        case State.PoweredOff:
            return 'bluetooth-off';
        case State.Resetting:
            return 'bluetooth-connect';
        case State.Unauthorized:
            return 'bluetooth-settings';
        case State.Unsupported:
            return 'bluetooth-off';
        case State.Unknown:
            return 'bluetooth-off';
        default:
            return 'bluetooth-off';
    }

}
export enum BleDeviceTypeIcons {
    Device = 'devices',
    Service = 'wrench-outline',
    Characteristic = 'tag-multiple-outline',
    Descriptor = 'tag-multiple-outline',
    Loading = 'loading'
}

