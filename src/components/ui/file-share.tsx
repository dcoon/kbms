import { utillog as log } from '@/services/log/log-service';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { IconButton } from 'react-native-paper';

const LOG_SRC = "FileShare";

export async function pickAndShareFile(): Promise<void> {
    try {
        // 1. Pick the document
        const result: DocumentPicker.DocumentPickerResult = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            copyToCacheDirectory: true,
        });

        // 2. Use 'canceled' property to narrow the type
        if (result.canceled) {
            log.info(LOG_SRC, "User cancelled");
            return;
        }

        // Now TypeScript knows 'assets' exists and is an array
        const fileUri = result.assets[0].uri;

        // 3. Check sharing availability and share
        const isSharingAvailable = await Sharing.isAvailableAsync();

        if (isSharingAvailable) {
            await Sharing.shareAsync(fileUri, {

            });
        } else {
            Alert.alert("Error", "Sharing is not available on this device");
        }
    } catch (error) {
        Alert.alert("Error", "An error occurred");
        log.error(LOG_SRC, "An error occurred", error);
    }
};


export async function shareLogFile() {

    const LOG_PREFIX = LOG_SRC + "shareLogFile";

    try {
        const logFileUri = await getLatestLogFile();

        if (logFileUri) {
            log.debug(LOG_PREFIX, "Sharing log file:", logFileUri);

            await shareFile(logFileUri);
        } else {
            log.warn(LOG_PREFIX, "No log file found");
        }
    } catch (error) {
        log.error(LOG_PREFIX, "An error occurred", error);
    }

};

export async function getLatestLogFile(): Promise<string | null> {

    const logDir = FileSystem.cacheDirectory;
    // const logName = `blex_logs_${new Date().toISOString().split('T')[0]}.txt`;
    // const fileUri = logDir + logName;

    const files = await FileSystem.readDirectoryAsync(logDir!);

    const logFiles = files.filter(file => file.startsWith("blex_logs_") && file.endsWith(".txt"));

    if (logFiles.length === 0) {
        return null;
    }

    const latestFiles = logFiles.sort((a, b) => {
        const dateA = new Date(a.substring(10, 20));
        const dateB = new Date(b.substring(10, 20));
        return dateB.getTime() - dateA.getTime();
    });

    return logDir + latestFiles[0];

}

export async function shareFile(fileUri: string) {

    const LOG_PREFIX = LOG_SRC + "shareFile";

    const fileExits = await checkIfFileExists(fileUri);

    if (!fileExits) {
        log.warn(LOG_PREFIX, "Log file does not exist");
    }
    // 1. Check if sharing is available on the device
    const isAvailable = await Sharing.isAvailableAsync();

    if (isAvailable) {
        // 2. Share the file directly from the private directory
        await Sharing.shareAsync(fileUri, {
            mimeType: 'text/plain', // Optional but recommended
            dialogTitle: 'Share this log file', // Android specific
        });
    } else {
        alert("Sharing is not available on this platform");
    }

}

export async function checkIfFileExists(fileUri: string): Promise<boolean> {
    //   const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo.exists;
};

export async function listFilesInDir(dirUri: string): Promise<string[]> {
    return FileSystem.readDirectoryAsync(dirUri);
};

interface FileShareButtonProps {
    icon?: string;
}

export function FileShareButton({ icon = "share" }: FileShareButtonProps) {
    return (
        <IconButton icon={icon} onPress={pickAndShareFile} />
    );
}