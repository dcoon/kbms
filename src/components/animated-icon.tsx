import { Image } from 'expo-image';
import { View } from 'react-native';

export function AnimatedSplashOverlay() {
  return null;
}

export function AnimatedIcon() {
  return (
    <View>
      <View>
        <Image source={require('@/assets/images/logo-glow.png')} />
      </View>

      <View>
        <div />
      </View>

      <View>
        <Image source={require('@/assets/images/expo-logo.png')} />
      </View>
    </View>
  );
}
