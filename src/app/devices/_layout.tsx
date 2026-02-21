import { Stack } from 'expo-router';

export default function DeviceLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerBackTitle: 'Back',
      }}
    />
  );
}
