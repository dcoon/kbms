import { MD3LightTheme } from 'react-native-paper';




const guageCenterLabelTextStyle = {

  color: '#5B635F', // Dark text for title
  fontSize: 8,
  // lineHeight: 16,
};

const guageCenterLabelStyle = {
  container: {
    alignItems: 'center',
  },
  title: {
    ...guageCenterLabelTextStyle,
    fontSize: 8,
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
    primary: '#003921',        // Mint Green from the ring
    onPrimary: '#003921',      // Deep Green for text on buttons
    primaryContainer: '#C6EAD7', // A darker, muted mint for headers
    onPrimaryContainer: '#003921', // Deep green text for the header    secondary: '#4A7C66',
    surface: '#F9FBF9',        // Off-white surface
    onSurface: '#1A211E',      // Dark text for List titles
    onSurfaceVariant: '#5B635F', // Muted text for List descriptions
    outline: '#C4CDC9',        // Borders for list dividers
    elevation: {
      level1: '#FFFFFF',       // Card background
    },
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
    Gauge: {
      centerLabel: { ...guageCenterLabelStyle },
    },
  },
};
