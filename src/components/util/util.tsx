import { ThemeType } from "@/theme/theme";
import { ConnectionState, ConnectionStateIconSource } from "@/util/util";
import { TouchableRipple, useTheme } from "react-native-paper";
import { IconFromIconSource } from "../ble/icons";


export function ConnectionStateIcon({ isDeviceConnected, onPress }: { isDeviceConnected: ConnectionState; onPress?: () => void; }) {

    const theme = useTheme() as ThemeType;
    const icon = ConnectionStateIconSource(isDeviceConnected, theme);

    if(onPress === undefined || onPress === null) {
        return (
            <IconFromIconSource source={icon} theme={theme} />
        );
    } else {
        return (
            <TouchableRipple onPress={onPress}>
                <IconFromIconSource source={icon} theme={theme} />
            </TouchableRipple>
        );
    }
}
  
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

