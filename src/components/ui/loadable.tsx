
import { SnackbarMessage } from '@/components/ui/snackbar';
import { Loadable, LoadableState } from '@/services/ble/ble-types';
import { uilog as log } from '@/services/log/log-service';
import { View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

const LOG_SRC = "LoadableGuard";


function LoadingPlaceholder() {
  return (
    <View style={{ marginTop: 32, alignItems: 'center' }}>
      <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
        Loading devices...
      </Text>
    </View>
  );
}

function ErrorPlaceholder({ error }: { error: Error }) {
  return (
        <View>
          <SnackbarMessage message={error.message} />
          <IconButton  icon="alert-circle-outline" />
          <Text>{error.message}</Text>
        </View>
      );
}


interface LoadableGuardProps<T> {
  loadable: Loadable<T>;
  loadingPlaceholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
  children?: React.ReactNode;
}

export function LoadableGuard<T>({ loadable, loadingPlaceholder, errorPlaceholder, children }: LoadableGuardProps<T>) {  

  const LOG_PREFIX = LOG_SRC + ": LoadableGuard";

  switch (loadable.state) {
    case LoadableState.loading:
      log.debug(LOG_PREFIX, "Loading...");
      return loadingPlaceholder ?? <LoadingPlaceholder />;
    case LoadableState.hasError:
        log.error(LOG_PREFIX, "Error:", loadable.error);
      return errorPlaceholder ?? <ErrorPlaceholder error={loadable.error as Error} />;
    case LoadableState.hasData:
      log.debug(LOG_PREFIX, "Has data");
      return <View>{children}</View>;
    default:
      log.error(LOG_PREFIX, "Invalid Loadable state");
      return null;
  } 
}


