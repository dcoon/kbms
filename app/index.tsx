import { Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@rneui/themed';

import { Icon, IconName } from "@/components/icon";
export default function Index() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Icon name={IconName.BLUETOOTH_OFF} />
      <Text>BATTERY MONITOR</Text>
      <Card>
      </Card>

    </SafeAreaView>
  );
}
