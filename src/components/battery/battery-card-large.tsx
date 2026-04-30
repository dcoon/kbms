import { BatteryData } from "@/services/battery/battery";
import { socIconSource } from "@/services/battery/icons";
import { DefaultTheme } from "@/theme/theme";
import { View } from "react-native";
import { Card, useTheme } from "react-native-paper";
import { IconFromIconSource } from "../ble/icons";
import { Gauge } from "../ui/gauge";
import { BatteryLastSeenChip, BatteryStatusIcon } from "./icons";


export function BatteryCardLarge({ battery, children }: { battery: BatteryData | undefined, children?: React.ReactNode }) {
    const theme = useTheme() as typeof DefaultTheme;


    const soc = battery?.soc ? Math.round(battery.soc) : undefined;
    const current = battery?.current ? battery.current / 1000 : undefined;

    const voltage = battery?.voltage ? battery.voltage / 1000 : undefined;
    // const temperature = battery.temperature / 100;
    // const status = battery.rawStatus;
    // const cycles = battery.cycles;
    // const subtitle = `${voltage}V / ${current}A`;

    // TODO: make these settings
    const MAX_VOLTAGE = 15;
    const MAX_CURRENT = 100;


    const icon = socIconSource({ soc, charging: current !== undefined && current < 0, theme });
    const strokeColor = (icon as {color: string}).color;

    return (
        <Card theme={theme.components.PrimaryCard.theme as any}>
            <Card.Title
                title="State of Charge"
                left={(props) => <IconFromIconSource source={icon} theme={theme} />}
                style={theme.components.Card.Title.style}

            />
            <Card.Content>
                <View style={{ flexDirection: 'column', }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }} >
                        <Gauge
                            value={soc}
                            maxvalue={100}
                            valuesuffix='%'
                            variant={theme.components.Gauge.large}
                            strokecolor={strokeColor}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <BatteryLastSeenChip battery={battery}/>
                        <BatteryStatusIcon status={battery?.status} />
                        {children}
                    </View>
                </View>
            </Card.Content>
        </Card>

    );
}
