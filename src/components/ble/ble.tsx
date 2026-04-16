import { Pressable } from "react-native";
import { Icon } from "react-native-paper";
import { DEFAULT_ICON_SIZE } from "../ui/ui-util";

export function IconForScanningState({ isScanning, size = DEFAULT_ICON_SIZE }: { isScanning: boolean, size?: number }) {

    if (isScanning) {
        return (<Icon source="stop" size={size} />);
    } else {
        return (<Icon source="refresh" size={size} />);
    }
}


export function IconForConnectionState({ isDeviceConnected, size = DEFAULT_ICON_SIZE, onPress }: { isDeviceConnected: boolean, onPress?: () => void, size?: number }) {

    const icon = isDeviceConnected ? "stop" : "refresh";
        return (
            <Pressable onPress={onPress}>
                <Icon source={icon} size={size} />
            </Pressable>
        );
}


export enum RssiLevel {
    NoSignal = -100,
    Weak = -90,
    Moderate = -80,
    Strong = -70
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
        return (<Icon source="signal-cellular-outline" size={size} />); // no signal    
    }
}

