import React from 'react';
import { View } from 'react-native';
import { Button, Dialog, PaperProvider, Portal, Text } from 'react-native-paper';

interface ConfirmationDialogProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmationDialog = ({ visible, onConfirm, onCancel, title, message }: ConfirmationDialogProps) => {

  return (
    <PaperProvider>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Portal>
          <Dialog visible={visible} onDismiss={onCancel}>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">
                {message}
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={onCancel}>Cancel</Button>
              <Button onPress={onConfirm} textColor="red">
                Delete
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
};

export default ConfirmationDialog;