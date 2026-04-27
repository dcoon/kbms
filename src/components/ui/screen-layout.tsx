
import { StyleSheet, View } from 'react-native';
import { Appbar } from 'react-native-paper';

import { BackAction, BleStateAction } from '@/components/ui/app-topbar';
import { useRouter } from 'expo-router';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';



interface ScreenLayoutProps {
    title: string;
    subtitle?: string;
    icon?: IconSource;
    showBackAction?: boolean ;
    onPressIcon?: () => void;
    onPressBack?: () => void;
    actions?: React.ReactNode;
    children: React.ReactNode;
}


export function ScreenLayout({ children, title, subtitle, icon, onPressIcon,
    onPressBack,
    actions, showBackAction = true }: ScreenLayoutProps) {

    const router = useRouter();

    if (!onPressBack) {
        onPressBack = () => router.back();
    }

    // TODO: switch back to using AppTopBar
    return (
        <View style={styles.container}>

            <Appbar.Header>
                <BackAction visible={showBackAction} />
                <Appbar.Content title={title} />
                <Appbar.Content title={subtitle} />
                <BleStateAction />
                {actions}
            </Appbar.Header>


            {children}


        </View>

    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1, // Ensures the view takes up the whole screen
    },
    scrollContent: {
        paddingBottom: 20, // Prevents the last item from being cut off
    },
});