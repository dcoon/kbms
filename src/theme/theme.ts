import { PixelRatio } from 'react-native';
import { DefaultTheme, MD3LightTheme } from 'react-native-paper';



const BASE_SCREEN_WIDTH = 375;

const KV_PRIMARY_COLOR = "#689f38";

const colors = {
  ...MD3LightTheme.colors,
  "primary": KV_PRIMARY_COLOR,
  "surface": KV_PRIMARY_COLOR,
  "warning": "rgb(255, 160, 0)",
  "ok": "rgb(0, 200, 83)",
}


const fonts = {
  ...MD3LightTheme.fonts,
  // labelLarge: {
  //   ...MD3LightTheme.fonts.labelLarge,
  //   fontSize: 36,
  //   fontWeight: "bold",
  //   // fontColor: colors.primary,
  // },
  // labelMedium: {
  //   ...MD3LightTheme.fonts.labelMedium,
  //   fontSize: 14,
  //   fontWeight: "normal",
  //   // fontColor: colors.secondary,
  // },
}


const icons = {
  iconSize: 24,
  home: { source: 'home-outline', color: colors.primary },
  system: { source: 'home-battery-outline' },
  battery: {
    unknown: { source: 'battery-unknown', color: colors.primary },
    alert: { source: 'battery-alert', color: colors.error },
    high: { source: 'battery-high', color: colors.primary },
    medium: { source: 'battery-medium', color: colors.secondary },
    low: { source: 'battery-low', color: colors.error },
    empty: { source: 'battery-outline', color: colors.error },
    charging: {
      unknown: { source: 'battery-unknown', color: colors.primary },
      alert: { source: 'battery-alert', color: colors.error },
      high: { source: 'battery-charging-high', color: colors.primary },
      medium: { source: 'battery-charging-medium', color: colors.secondary },
      low: { source: 'battery-charging-low', color: colors.error },
      empty: { source: 'battery-charging-outline', color: colors.error },
    },
  },
  deltaV: {
    high: { source: 'alert-outline', color: colors.error },
    medium: { source: 'alert-outline', color: colors.warning },
    low: { source: 'delta', color: colors.ok },
    unknown: { source: 'delta', color: colors.onSurface },
  },
}


const gaugeStyleDefault = {
  radius: 0.1 * BASE_SCREEN_WIDTH,
  thickness: 5,
  title: {
    color: colors.primary,
    font: fonts.labelLarge
  },
  subtitle: {
    color: colors.secondary, // Dark text for subtitle
    font: fonts.labelSmall,
  },
  startAngle: 170,
  endAngle: 10,
  strokecolor: colors.primary,
  backgroundStrokeColor: colors.primary,
  textColor: colors.onSurface,
  fontFamily: fonts.bodyMedium.fontFamily,
};

const components = {
  Snackbar: {
    style: {
      backgroundColor: '#ffffff', // Light gray background for Snackbar
    },
    contentStyle: {
      color: '#212121', // Dark text for readability
    },
  },
  Gauge: {
    default: gaugeStyleDefault,
    small: gaugeStyleDefault,
    large: {
      ...gaugeStyleDefault,
      radius: 0.4 * BASE_SCREEN_WIDTH,
      thickness: 18,
      title: {
        color: colors.primary,
        font: fonts.displayLarge,
      },
      subtitle: {
        color: colors.secondary, // Dark text for subtitle
        font: fonts.displayMedium,
      },
    },
  },
  Card: {
    theme: {
      roundness: 5, // Square corners for Card
    },
    style: {
      backgroundColor: colors.background, // White background for Card
      borderColor: colors.background, // Green border for Card
      borderWidth: 2,
      margin: 5,
      padding: 2,
    },
    Title: {
      style: {
        marginHorizontal: 0,
      },
      leftStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 0,
      },
      titleStyle: {
        fontSize: fonts.labelMedium.fontSize,
        fontWeight: 'bold',
        marginLeft: 0,
        alignItems: 'baseline',
      },
      rightStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginRight: 0,
        columnGap: 0,
      },
    },
    Content: {
      style: {
        // flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 2,
        // marginBottom: 0,
      },
    },
  },
  PrimaryCard: {
    theme: {
      roundness: 0, // Square corners for Card
    },
  },
  SegmentedButtons: {
    density: "small",
    style: {
      backgroundColor: 'transparent', // Transparent background for SegmentedButtons
    },
    buttonStyle: {
      fontSize: 12,
    },
  },
  Chip: {
    style: {
      backgroundColor: 'transparent', // Transparent background for Chips
      borderColor: colors.primary, // Green border for Chips
      borderWidth: 1,
    },
    textStyle: {
      color: colors.primary, // Green text for Chips
      fontSize: 12,

    },
  },
  valueChip: {
    style: {
      alignItems: 'center',
      flexDirection: 'column',
      rowGap: 6
    },
    textStyle: {
      color: colors.primary, // Green text for Chips
      fontSize: 12,

    },
  },
}



type ThemeType = typeof DefaultTheme & {
  colors: typeof colors,
  icons: typeof icons,
  components: ComponentsType
};
type ColorsType = typeof DefaultTheme.colors;
type FontsType = typeof DefaultTheme.fonts;
type ComponentsType = typeof components;

export const LightTheme = {
  ...MD3LightTheme,
  icons: icons,
  colors: colors,
  // fonts: fonts,
  components: components,
} as ThemeType;


function deepVisit(obj: any, visitor: (parent: any, key: string | number, value: any) => void): void {
  // Ensure the input is an object or array and not null
  if (obj === null || typeof obj !== 'object') {
    return;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      // Apply the visitor function to the current property
      visitor(obj, key, value);

      // Recursively visit if the property value is an object or array
      if (value !== null && typeof value === 'object') {
        deepVisit(value, visitor);
      }
    }
  }
}



export function adjustThemeForScreenSize(theme: ThemeType, width: number, height: number): ThemeType {

  const scale = Math.min(width / BASE_SCREEN_WIDTH, 1.5); // Cap scaling at 2x

  const adjustedTheme = structuredClone(theme);


  deepVisit(adjustedTheme, (parent, key, value) => {

    switch (key) {
      case 'fontSize':
        const newValue = Math.round(PixelRatio.roundToNearestPixel(value * scale));
        parent[key] = newValue;
        break;
      case 'lineHeight':
      case 'iconSize':
      case 'radius':
      case 'thickness':
        parent[key] = value * scale;
        break;
    }
  });

  return adjustedTheme;
}
