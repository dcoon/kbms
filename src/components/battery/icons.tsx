import { BatteryData, BatteryStatus } from "@/services/battery/battery";
import { batteryLastSeenIconSource, cellDeltaVIconSource, cellVoltageIconSource, socIconSource } from "@/services/battery/icons";
import { DeviceId, DeviceOrFavorite } from "@/services/ble/ble";
import { log } from "@/services/log/log-service";
import { Favorite, Settings } from "@/services/settings/settings-service";
import { DefaultTheme, ThemeType } from "@/theme/theme";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Chip, Icon, Menu, Text, TouchableRipple, useTheme } from "react-native-paper";
import { IconFromIconSource } from "../ble/icons";
import { ConnectionStateFromLoadable } from "../util/util";


import * as Battery from '@/services/battery/battery-service';
import { ConnectionStateIconSource, ConnectionStateMenuText } from "@/util/util";
import { formatDistance, formatDistanceStrict } from "date-fns";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

export enum IconMenuOrButton {
    Icon = "icon",
    Menu = "menu",
    Button = "button",
    Chip = "chip"
}

export function favoriteIconSource(isFavorite: boolean, theme: ThemeType) {
    return isFavorite ? theme.icons.favorite.true : theme.icons.favorite.false;
}

export function FavoriteIcon({ device, onPress, iconMenuOrButton = IconMenuOrButton.Button }: { device: DeviceOrFavorite, onPress?: () => void, iconMenuOrButton?: IconMenuOrButton }) {

    const LOG_PREFIX = "FavoriteIcon";


    const [isFavorite, setIsFavorite] = useAtom(Settings.favorite({ id: device.id } as Favorite));
    const theme = useTheme() as ThemeType;
    const icon = favoriteIconSource(isFavorite, theme);


    function onPressDefault() {
        log.info(LOG_PREFIX, "Toggling favorite for device ID: ", device.id);
        setIsFavorite({ id: device.id, name: device.name } as Favorite);

        if (onPress) {
            onPress();
        }
    }


    if (iconMenuOrButton === IconMenuOrButton.Menu) {

        const text = isFavorite ? "Remove" : "Add";

        return (
            <Menu.Item onPress={onPressDefault} title={text} leadingIcon={icon.source} />
        );

    } else if (iconMenuOrButton === IconMenuOrButton.Icon) {
        return (
            <Icon source={icon.source} size={DefaultTheme.icons.iconSize} />
        );
    } else {
        return (
            <TouchableRipple onPress={onPressDefault} >
                <Icon source={icon.source} size={DefaultTheme.icons.iconSize} color={icon.color} />
            </TouchableRipple>
        );
    }
}

export function BatterySocIcon({ soc, charging = false, theme = DefaultTheme }: { soc?: number, charging?: boolean, theme?: ThemeType }) {

    const icon = socIconSource({ soc, charging, theme });

    return <IconFromIconSource source={icon} theme={theme} />;

}

function BatteryLastSeen({ battery, onPress, showChip = false }: { battery: BatteryData | undefined; onPress?: () => void; showChip: boolean }) {

    const [lastRefreshed, setLastRefreshed] = useState(Date.now());
    const [,pushSnackbar] = useAtom(Settings.snackbar);

    const theme = useTheme() as ThemeType;



    const INTERVAL_DURATION = 10 * 1000;  // refresh every 10 seconds

    const refreshEveryMinute = useEffect(() => {
        const interval = setInterval(() => {
            setLastRefreshed(Date.now());
        }, INTERVAL_DURATION);
        return () => clearInterval(interval);
    }, []);


    const getIcon = useCallback(() => {
        const lastUpdated = battery?.lastUpdated;
        return batteryLastSeenIconSource(lastRefreshed, lastUpdated, theme);
    }, [battery, theme, lastRefreshed]);

    const getLastSeenText = useCallback((strict = false) => {
        const lastUpdated = battery?.lastUpdated;
        const now = Math.max(lastRefreshed, Date.now());

        if (lastUpdated === undefined || lastUpdated === null) {
            return "Unknown";
        } else if (strict) {
            return formatDistanceStrict(lastUpdated, now, { addSuffix: true });
        } else {
            return formatDistance(lastUpdated, now, { addSuffix: true });
        }
        
    }, [battery, lastRefreshed]);

    if (onPress === undefined || onPress === null) {
        onPress = onPressDefault;
    }

    function onPressDefault() {
        // setIsBatteryConnected(true);
        const lastSeenText = getLastSeenText(true);
        pushSnackbar(`Battery last seen ${lastSeenText}`);
    }

    if (showChip) {

        return (
            <Chip
                icon={(props) => <IconFromIconSource source={getIcon()} theme={theme} />}
                onPress={onPress} style={theme.components.Chip.style}
                textStyle={theme.components.Chip.textStyle}
                compact={true}
            >{getLastSeenText()}</Chip>
        );
    } else {
        return (
            <TouchableRipple onPress={onPress}>
                 <IconFromIconSource source={getIcon()} theme={theme} />
            </TouchableRipple>
        );
    }


}

export function BatteryLastSeenChip({ battery, onPress }: { battery: BatteryData | undefined; onPress?: () => void; }) {

    return (<BatteryLastSeen battery={battery} onPress={onPress} showChip={true} />);
}


export function BatteryLastSeenListIcon({ battery, onPress }: { battery: BatteryData | undefined; onPress?: () => void; }) {
    return <BatteryLastSeen battery={battery} onPress={onPress} showChip={false} />;
}

export function BatteryIsConnectedIcon({ battery, onPress, iconMenuOrButton = IconMenuOrButton.Icon }: { battery: { id: DeviceId }; onPress?: () => void; iconMenuOrButton?: IconMenuOrButton }) {

    const theme = useTheme() as ThemeType;
    const deviceId = battery.id;
    const [isConnectedLoadable, setIsConnected] = useAtom(Battery.isBatteryConnected(deviceId));
    const connectedState = ConnectionStateFromLoadable({ loader: isConnectedLoadable });
    const icon = ConnectionStateIconSource(connectedState);

    const onPressDefault = () => {
        const isConnected = isConnectedLoadable.state === 'hasData' && isConnectedLoadable.data === true;
        setIsConnected(!isConnected);

        if (onPress) {
            onPress();
        }
    };

    if (iconMenuOrButton === IconMenuOrButton.Menu) {

        const text = ConnectionStateMenuText(connectedState);
        const name = (icon as { source: string }).source as string;

        return (
            <Menu.Item onPress={onPressDefault} title={text} leadingIcon={name} />
        );

    } else if (iconMenuOrButton === IconMenuOrButton.Button) {
        return (
            <TouchableRipple onPress={onPressDefault}>
                <IconFromIconSource source={icon} theme={theme} />
            </TouchableRipple>
        );
    } else {
        return (
            <IconFromIconSource source={icon} theme={theme} />
        );
    }
}

export function CellVoltageIcon({ cellv }: { cellv?: number }) {


    const theme = useTheme() as typeof DefaultTheme;
    const icon = cellVoltageIconSource({ cellv, theme });

    return <IconFromIconSource source={icon} theme={theme} />;


}

export function BatteryDeltaVIcon({ deltav }: { deltav?: number }) {

    const theme = useTheme() as typeof DefaultTheme;
    const icon = cellDeltaVIconSource({ deltav });
    // const { source, color, size } = icon as { source: string; color: string; size: number };


    if (deltav === undefined || deltav === null || isNaN(deltav)) {
        return null;
    }

    const deltavText = deltav ? Math.round(deltav) + "mV" : "";

    return (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' }}>
            <IconFromIconSource source={icon} theme={theme} />
            <Text variant="bodySmall" style={{ marginRight: 10 }}>{deltavText}</Text>
        </View>
    );

}

export function BatteryStatusIcon({ status, showNoFlags }: { status: BatteryStatus | undefined, showNoFlags?: boolean }) {

    const theme = useTheme() as typeof DefaultTheme;

    const icon = theme.icons.battery.status.alert;
    const flags = ["HV", "LV", "OCC", "OCD", "LTD", "LTC", "HTD", "HTC"] as const;

    if(status === undefined) {
        status = new BatteryStatus();
    }

    const activeFlags = flags.filter(flag => status[flag]);

    if (activeFlags.length === 0) {
        return showNoFlags ? (<Chip key="OK"
            icon={icon as IconSource}
            mode="outlined"
            style={theme.components.Chip.style}
            textStyle={{ ...theme.components.Chip.textStyle, color: theme.icons.ok.color }}
            compact={true}
        >OK</Chip>) : null;
    }

    return (
        <View style={{ flexDirection: 'row', }}>
            {activeFlags.map(flag => (
                <Chip key={flag}
                    icon={icon as IconSource}
                    mode="outlined"
                    style={theme.components.Chip.style}
                    textStyle={{ ...theme.components.Chip.textStyle, color: theme.icons.alert.color }}
                    compact={true}
                >{flag}</Chip>
            ))}
        </View>
    );
}

