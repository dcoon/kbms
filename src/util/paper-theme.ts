import { MD3LightTheme } from 'react-native-paper';




const guageCenterLabelTextStyle = {

  color: '#3D7375', // Dark text for title
  fontSize: 10,
  lineHeight: 16,
};

const guageCenterLabelStyle = {
  container: {
    alignItems: 'center',
  },
  title: {
    ...guageCenterLabelTextStyle,
    fontSize: 14,
  },
  subtitle: {
    ...guageCenterLabelTextStyle,
  },
  value: {
    ...guageCenterLabelTextStyle,
  },
};


/**
 * A simple light theme for React Native Paper.
 * Important elements use 'green' (#2e7d32).
 * Unimportant elements use 'gray' (#757575).
 */
export const PaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // primary: '#2e7d32', // Important (Green)
    primary: '#3D7375',
    onPrimary: '#ffffff',
    primaryContainer: '#e8f5e9',
    onPrimaryContainer: '#1b5e20',

    secondary: '#757575', // Unimportant (Gray)
    onSecondary: '#ffffff',
    secondaryContainer: '#f5f5f5',
    onSecondaryContainer: '#212121',

    tertiary: '#757575',
    onTertiary: '#ffffff',

    outline: '#bdbdbd',
    surfaceVariant: '#f5f5f5',
    onSurfaceVariant: '#616161',

    error: '#b00020',
    background: '#ffffff',
    surface: '#ffffff',

    // Adjusted Snackbar for readability in light theme:
    // Using a light surface with dark text to ensure children <Text> components remain readable.
    inverseSurface: '#f5f5f5',    // Light gray background
    inverseOnSurface: '#212121',  // Dark text
    inversePrimary: '#2e7d32',    // Green for actions
  },
  components: {
    Snackbar: {
      style: {
        backgroundColor: '#ffffff', // Light gray background for Snackbar
      },
      contentStyle: {
        color: '#212121', // Dark text for readability
      },
    },
    Guage: {
      centerLabel: { ...guageCenterLabelStyle } ,
    },
  },
};
