import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#208AEF',
    secondary: '#5856D6',
    tertiary: '#34C759',
    error: '#FF3B30',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    outline: '#E2E8F0',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: MD3DarkTheme.colors,
};
