import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <View />
  );
}

export function AnimatedIcon() {
  return (
    <View>
      <View>
        <Image source={require('@/assets/images/logo-glow.png')} />
      </View>

      <View />
      <View>
        <Image source={require('@/assets/images/expo-logo.png')} />
      </View>
    </View>
  );
}
