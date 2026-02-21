import React from 'react';
import { View, Text } from 'react-native';

type HintRowProps = {
  title?: string;
  hint?: string;
};

export function HintRow({ title = 'Try editing', hint = 'app/index.tsx' }: HintRowProps) {
  return (
    <View>
      <Text>{title}</Text>
      <View>
        <Text>
          {hint}
        </Text>
      </View>
    </View>
  );
}
