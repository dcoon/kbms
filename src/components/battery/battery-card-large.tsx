import { BatteryData } from "@/services/battery/battery";
import { socIconSource } from "@/services/battery/icons";
import { DefaultTheme } from "@/theme/theme";
import { View } from "react-native";
import { Card, Chip, Icon, useTheme } from "react-native-paper";
import { Gauge } from "../ui/gauge";
import { BatteryLastSeenChip, BatteryStatusFlags } from "./icons";



function BatteryCardLargePlaceholder() {
    const theme = useTheme() as typeof DefaultTheme;

    return (
        <Card theme={theme.components.PrimaryCard.theme as any}>
            <Card.Title
                title="State of Charge"
                left={(props) => <Icon source={theme.icons.battery.medium.source} color={theme.colors.onSurface} size={theme.icons.iconSize} />}
                style={theme.components.Card.Title.style}

            />
            <Card.Content>
                <View style={{ flexDirection: 'column', }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }} >
                        <Gauge
                            value={undefined}
                            maxvalue={100}
                            valuesuffix='%'
                            variant={theme.components.Gauge.large}
                            strokecolor={theme.colors.primary}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Chip icon="clock-outline" style={theme.components.Chip.style} textStyle={theme.components.Chip.textStyle} compact={true}>Last seen: Unknown</Chip>

                    </View>
                </View>
            </Card.Content>
        </Card>

    );
}

export function BatteryCardLarge({ battery, children }: { battery: BatteryData | undefined, children?: React.ReactNode }) {
    const theme = useTheme() as typeof DefaultTheme;


    if(!battery) {
        return <BatteryCardLargePlaceholder />;
    }

    const soc = Math.round(battery.soc);
    const current = battery.current / 1000;

    const voltage = battery.voltage / 1000;
    // const temperature = battery.temperature / 100;
    // const status = battery.rawStatus;
    // const cycles = battery.cycles;
    // const subtitle = `${voltage}V / ${current}A`;

    // TODO: make these settings
    const MAX_VOLTAGE = 15;
    const MAX_CURRENT = 100;


    const socIS = socIconSource({ soc, charging: current < 0, theme });
    const strokeColor = socIS.color;

    return (
        <Card theme={theme.components.PrimaryCard.theme as any}>
            <Card.Title
                title="State of Charge"
                left={(props) => <Icon source={theme.icons.battery.medium.source} color={theme.colors.onSurface} size={theme.icons.iconSize} />}
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
                        <BatteryStatusFlags status={battery.status} />
                        {children}
                    </View>
                </View>
            </Card.Content>
        </Card>

    );
}
