
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

export function SignalIcon({ rssi }: { rssi: number }) {
  const theme = useTheme();
  let name: keyof typeof MaterialCommunityIcons.glyphMap = 'signal-cellular-outline';
  let color = 'grey' //theme.colors.tertiary;
  
  if(rssi === undefined) {
    // name = 'signal-cellular-off';
  } else if (rssi >= -55) {
    name = 'signal-cellular-3';
    color = 'green';
  } else if ( rssi >= -65) {
    name = 'signal-cellular-2';
    color = 'green' //theme.colors.secondary;
  } else if (rssi !== undefined && rssi >= -75) {
    name = 'signal-cellular-1';
    color = 'red' //theme.colors.error;
  }

  return <MaterialCommunityIcons name={name} size={18} color={color} />;
}
