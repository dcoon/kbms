import { Stack } from 'expo-router';


export const unstable_settings = {
  // Ensures deep links to subpages can navigate back to the main settings list
  initialRouteName: 'index',
};

export default function DeviceLayout() {
  return <Stack screenOptions={{ headerShown: false }}/>;
}
