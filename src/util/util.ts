import { DefaultTheme, ThemeType } from "@/theme/theme";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";


// loadable helpers
export enum LoadableState {
  hasData = 'hasData',
  hasError = 'hasError',
  loading = 'loading'
} 

export type Loadable<T> = { state: 'loading'; } |
{ state: 'hasData'; data: Awaited<T>; } |
{ state: 'hasError'; error: unknown; };


export enum ConnectionState {
    Connected = "connected",
    Connecting = "connecting",
    Disconnected = "disconnected",
    Error = "error"
}


export function getIconForLoadableState(state: LoadableState, hasDataIcon: string = 'unknown'): string {
    switch (state) {
        case LoadableState.hasData:
            return hasDataIcon;
        case LoadableState.hasError:
            return 'alert-circle-outline';
        case LoadableState.loading:
            return 'loading';
        default:
            return 'help-circle-outline';
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
            return "Unknown";
    }
}

export function ConnectionStateIconSource(isDeviceConnected: ConnectionState, theme: ThemeType = DefaultTheme): IconSource {
    switch (isDeviceConnected) {
        case ConnectionState.Connected:
            return theme.icons.connectionState.connected as IconSource;
        case ConnectionState.Connecting:
            return theme.icons.connectionState.connecting as IconSource;
        case ConnectionState.Disconnected:
            return theme.icons.connectionState.disconnected as IconSource;
        case ConnectionState.Error:
            return theme.icons.connectionState.error as IconSource;
        default:
            return theme.icons.connectionState.unknown as IconSource; // unknown state
    }

}




