import { Device } from "@/services/ble/ble";
import * as Bluetooth from "@/services/ble/ble-service";
import { rssiIconSource, ScanningStateIconSource } from "@/services/ble/icons";
import { ThemeType } from "@/theme/theme";
import { useAtom } from "jotai";
import { Icon, useTheme } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";


export function IconFromIconSource({ source, theme, size = theme.icons.iconSize }: { source: IconSource, theme: ThemeType, size?: number }) {

    const name = (source as { source: string }).source as string;
    const color = (source as { color?: string }).color;

    return <Icon source={name} color={color} theme={theme} size={size} />;
}

export function ScanningStateIcon({ isScanning }: { isScanning: boolean }) {

    const theme = useTheme() as ThemeType;
    const icon = ScanningStateIconSource(isScanning, theme);

    return (<IconFromIconSource source={icon} theme={theme} />);
}


export function RssiIcon({ device }: { device: Device }) {
    const theme = useTheme() as ThemeType;
    const [rssiLoadable] = useAtom(Bluetooth.rssi(device.id));
    const rssi = rssiLoadable.state === "hasData" ? rssiLoadable.data : device.rssi;
    const icon = rssiIconSource(rssi, theme);
    
    return IconFromIconSource({ source: icon, theme });

}
