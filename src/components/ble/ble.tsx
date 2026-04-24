import { Pressable } from "react-native";
import { Icon } from "react-native-paper";
import { DeviceOrFavorite } from "../ui/favorite-card";
import { DEFAULT_ICON_SIZE } from "../ui/ui-util";


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



export function ButtonForConnectionState({ isDeviceConnected, onPress, size = DEFAULT_ICON_SIZE }: { isDeviceConnected: ConnectionState, onPress: () => void, size?: number }) {

    return (
        <Pressable onPress={onPress}>
            <IconForConnectionState isDeviceConnected={isDeviceConnected} size={size} />
        </Pressable>
    );
}

export function IconForConnectionState({ isDeviceConnected, size = DEFAULT_ICON_SIZE, onPress }: { isDeviceConnected: ConnectionState, onPress?: () => void, size?: number }) {

    switch (isDeviceConnected) {
        case ConnectionState.Connected:
            return (<Icon source="stop" size={size} />);
        case ConnectionState.Connecting:
            return (<Icon source="progress-clock" size={size} />);
        case ConnectionState.Disconnected:
            return (<Icon source="refresh" size={size} />);
        case ConnectionState.Error:
            return (<Icon source="progress-circle" color="red" size={size} />);
        default:
            return (<Icon source="progress-question" size={size} />); // unknown state
    }

}


export enum RssiLevel {
    NoSignal = -90,
    Weak = -80,
    Moderate = -70,
    Strong = -60
}


export function IconForRssi({ rssi, size = DEFAULT_ICON_SIZE }: { rssi?: number | null, size?: number }) {


    if (rssi === undefined || rssi === null) {
        return (<Icon source="signal-off" size={size} />); //"signal-cellular-off"; // no signal
    } else if (rssi >= RssiLevel.Strong) {
        return (<Icon source="signal-cellular-3" color="green" size={size} />); // 4 bars
    } else if (rssi >= RssiLevel.Moderate) {
        return (<Icon source="signal-cellular-2" color="orange" size={size} />); // 3 bars                
    } else if (rssi >= RssiLevel.Weak) {
        return (<Icon source="signal-cellular-1" color="red" size={size} />); // 2 bars           
    } else {
        return (<Icon source="signal-cellular-outline" color="red" size={size} />); // no signal    
    }
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

