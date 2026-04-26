import { battery as batteryAtom, isBatteryConnected } from "@/services/ble/battery-service";
import { Favorite } from "@/services/settings/settings-service";
import { useAtom } from "jotai";
import { default as React, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Device } from "react-native-ble-plx";
import { Icon } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";
import { DEFAULT_ICON_SIZE } from "../ui/ui-util";



// Strings
// Components:
//   Pressable Icon
//   Icon
//   Menu.Item

export enum ConnectionState {
    Connected = "connected",
    Connecting = "connecting",
    Disconnected = "disconnected",
    Error = "error"
}




export function IconForScanningState({ isScanning, size = DEFAULT_ICON_SIZE }: { isScanning: boolean, size?: number }) {

    if (isScanning) {
        return (<Icon source="stop" size={size} />);
    } else {
        return (<Icon source="refresh" size={size} />);
    }
}


export function ConnectionStateMenuText(state: ConnectionState): string {

    switch (state) {
        case ConnectionState.Connected:
            return "Disconnect";
        case ConnectionState.Connecting:
            return "Connecting...";
        case ConnectionState.Disconnected:
            return "Connect";
        case ConnectionState.Error:
            return "Retry";
        default:
            return "Unknown State";
    }   
}

export function ConnectionStateIconSource(isDeviceConnected: ConnectionState): IconSource {
    switch (isDeviceConnected) {
        case ConnectionState.Connected:
            return { source: "stop" } as IconSource;
        case ConnectionState.Connecting:
            return { source: "progress-clock" } as IconSource;
        case ConnectionState.Disconnected:
            return { source: "refresh" } as IconSource;
        case ConnectionState.Error:
            return { source: "progress-circle", color: "red" } as IconSource;
        default:
            return { source: "progress-question" } as IconSource; // unknown state
    }

}

export function ConnectionStateIcon({ isDeviceConnected, size = DEFAULT_ICON_SIZE, onPress }: { isDeviceConnected: ConnectionState, onPress?: () => void, size?: number }) {

    return IconFromIconSource({ source: ConnectionStateIconSource(isDeviceConnected), size });

}


export function ConnectionStateButton({ isDeviceConnected, onPress, size = DEFAULT_ICON_SIZE }: { isDeviceConnected: ConnectionState, onPress: () => void, size?: number }) {

    return (
        <Pressable onPress={onPress}>
            <ConnectionStateIcon isDeviceConnected={isDeviceConnected} size={size} />
        </Pressable>
    );
}



export enum RssiLevel {
    NoSignal = -90,
    Weak = -80,
    Moderate = -70,
    Strong = -60
}

export function RssiIconSource(rssi?: number): IconSource {


    if (rssi === undefined || rssi === null) {
        return {source: "signal-off", color: "black"} as IconSource; //"signal-cellular-off"; // no signal
    } else if (rssi >= RssiLevel.Strong) {
        return {source: "signal-cellular-3", color: "green"} as IconSource; // 4 bars
    } else if (rssi >= RssiLevel.Moderate) {
        return {source: "signal-cellular-2", color: "orange"} as IconSource; // 3 bars                
    } else if (rssi >= RssiLevel.Weak) {
        return {source: "signal-cellular-1", color: "red"} as IconSource; // 2 bars           
    } else {
        return {source: "signal-cellular-outline", color: "red"} as IconSource; // no signal    
    }

}

export function IconFromIconSource({ source, size = DEFAULT_ICON_SIZE }: { source: IconSource, size?: number }) {

    if (typeof source === 'string') {
        return <Icon source={source} size={size} />;
    } else if (typeof source === 'object' && 'source' in source) {
        return <Icon source={(source as any).source} color={(source as any).color} size={size} />;
    } else {
        return null; // invalid source
    }
}

export function RssiIcon({ rssi, size = DEFAULT_ICON_SIZE }: { rssi?: number | null, size?: number }) {

    return IconFromIconSource({ source: RssiIconSource(rssi ? rssi : undefined), size });

}
export type OnDevicePress = (device: DeviceOrFavorite) => void;

export function ConnectionStateFromLoadable({ loader }: { loader: any; }): ConnectionState {

    switch (loader.state) {
        case 'loading':
            return ConnectionState.Connecting;
        case 'hasError':
            return ConnectionState.Error;
        case 'hasData':
            return loader.data ? ConnectionState.Connected : ConnectionState.Disconnected;
        default:
            return ConnectionState.Disconnected; // default to disconnected if state is unknown
    }

}

export function BatteryLastSeenIconSource(lastUpdated?: Date): IconSource {

    if (lastUpdated === undefined || lastUpdated === null) {
        return { source: "clock-alert-outline", color: "gray" } as IconSource; // never seen
    } else {
        const secondsSinceLastUpdate = (Date.now() - lastUpdated.getTime()) / 1000;

        if (secondsSinceLastUpdate < 2) {
            return { source: "clock-check-outline", color: "green" } as IconSource;
        } else if (secondsSinceLastUpdate < 4) {
            return { source: "clock-time-seven-outline", color: "orange" } as IconSource;
        } else if (secondsSinceLastUpdate < 6) {
            return { source: "clock-time-ten-outline", color: "orange" } as IconSource;
        } else if (secondsSinceLastUpdate < 10) {
            return { source: "update", color: "red" } as IconSource;
        } else {
            return { source: "clock-alert-outline", color: "red" } as IconSource;
        }

    }

}

export function BatteryLastSeenIcon({ lastUpdated }: { lastUpdated?: Date }) {
    return IconFromIconSource({ source: BatteryLastSeenIconSource(lastUpdated) });
}

export function BatteryLastSeenListIconButton({ device, onPress }: { device: DeviceOrFavorite, onPress?: () => void }) {

    const [lastRefreshed, setLastRefreshed] = useState(Date.now());
    const [, setIsBatteryConnected] = useAtom(isBatteryConnected(device.id));
    const [battery] = useAtom(batteryAtom(device.id));

    const lastUpdated = battery?.lastUpdated;


    const INTERVAL_DURATION = 60000;

    const refreshEveryMinute = useEffect(() => {
        const interval = setInterval(() => {
            setLastRefreshed(Date.now());
        }, INTERVAL_DURATION);
        return () => clearInterval(interval);
    }, []);


    if (onPress === undefined || onPress === null) {
        onPress = onPressDefault;
    }

    function onPressDefault() {
        // setIsBatteryConnected(true);
    }


    return (
        <Pressable onPress={onPress}>
            <BatteryLastSeenIcon lastUpdated={battery?.lastUpdated} />
        </Pressable>

    );

}

export function BatteryIsConnectedIconButton({ device }: { device: DeviceOrFavorite; }) {

    const [isConnectedLoadable, setIsConnected] = useAtom(isBatteryConnected(device.id));
    const connectedState = ConnectionStateFromLoadable({ loader: isConnectedLoadable });

    return (
        <ConnectionStateButton isDeviceConnected={connectedState} onPress={() => setIsConnected(connectedState === 'connected' ? false : true)} />
    );
}


export type DeviceOrFavorite = Device | Favorite;

