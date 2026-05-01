
import { View } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';

import { BleStateAction, getAppBarTheme } from '@/components/ui/topbar-actions';
import { ThemeType } from '@/theme/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';



interface ScreenLayoutProps {
    title: string;
    subtitle?: string;
    icon?: IconSource;
    showBackAction?: boolean;
    onPressIcon?: () => void;
    onPressBack?: () => void;
    actions?: React.ReactNode;
    children: React.ReactNode;
}


export function ScreenLayout({ children, title, subtitle, icon, onPressIcon,
    onPressBack,
    actions, showBackAction = true }: ScreenLayoutProps) {

    const theme = useTheme() as ThemeType;
    const appBarTheme = getAppBarTheme(theme);
    const router = useRouter();

    if (!onPressBack) {
        onPressBack = () => router.back();
    }

    // TODO: switch back to using AppTopBar
    return (
        <View>

            <Appbar.Header
                theme={appBarTheme} // Use onSurfaceVariant for AppBar text
            >
                <BackAction visible={showBackAction} theme={appBarTheme} />
                <Appbar.Content title={title}
                />
                <BleStateAction />
                {actions}
            </Appbar.Header>


            {children}


        </View>

    );
}


function BackAction({ visible, theme }: { visible: boolean; theme: ThemeType; }) {

    const router = useRouter();

    if (!visible) {
        return <View style={{ width: 52 }} />; // Placeholder to keep title centered
    } else {
        return (
            <Appbar.BackAction onPress={() => router.back()}
                theme={theme} />
        );
    }

}
