import log from '@/services/log/log-service';
import { Settings } from '@/services/settings/settings-service';
import { PaperTheme } from '@/util/paper-theme';
import { useAtom } from 'jotai';
import React from 'react';
import { Snackbar as PaperSnackbar, Portal, Text, useTheme } from 'react-native-paper';

interface SnackbarProps {

}


export function Snackbar() {

    const theme = useTheme() as typeof PaperTheme;

    const [message, pushMessage] = useAtom(Settings.snackbar);
    const [, shift] = useAtom(Settings.shiftSnackbar);
    const visible = message !== undefined;

    log.debug("SnackbarComponent: Rendering with snackbar context: ", visible, message);

    return (
        <Portal>
            <PaperSnackbar 
            style={theme.components?.Snackbar?.style}
            visible={visible}
                onDismiss={() => shift()}
                duration={PaperSnackbar.DURATION_SHORT}
                icon="close"
                action={{
                    label: '',
                    icon: 'close',
                    onPress: () => {
                        log.debug("SnackbarComponent: Dismiss action pressed");
                    }
                }}
            >
                <Text>{message}</Text>
            </PaperSnackbar>
        </Portal>
    );
}


interface SnackbarMessageProps {
    message?: string;
}

export function SnackbarMessage({ message }: SnackbarMessageProps) {
    const [, pushMessage] = useAtom(Settings.snackbar);

    React.useEffect(() => {
        if (message) {
            pushMessage(message);
        }
    }, [message, pushMessage]);

    return <></>;
}
