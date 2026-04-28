import { utillog as log, LOG_DIR, LOG_FILE_EXTENSION, LOG_FILE_PREFIX } from '@/services/log/log-service';
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
            log.info(LOG_PREFIX, "Sharing log file:", logFileUri);

            await shareFile(logFileUri);
        } else {
            log.warn(LOG_PREFIX, "No log file found");
        }
    } catch (error) {
        log.error(LOG_PREFIX, "An error occurred", error);
    }

};


export async function getLatestLogFile(): Promise<string | null> {

    const LOG_PREFIX = LOG_SRC + "getLatestLogFile";

    const files = await FileSystem.readDirectoryAsync(LOG_DIR);

    const logFiles = files.filter(file => file.startsWith(LOG_FILE_PREFIX));

    log.info(LOG_PREFIX, "Found log files: ", LOG_DIR, logFiles);

    if (logFiles.length === 0) {
        return null;
    }


    const latest = logFiles.reduce((latest, file) => {
        const latestTime = new Date(parseLogFileDate(latest)).getTime();
        const fileTime = new Date(parseLogFileDate(file)).getTime();
        return fileTime > latestTime ? file : latest;
    });

    return LOG_DIR + latest;

}


function parseLogFileDate(latest: string): string | number | Date {
    return latest.split(LOG_FILE_PREFIX)[1].split(`.${LOG_FILE_EXTENSION}`)[0];
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