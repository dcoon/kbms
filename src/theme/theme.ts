import { PixelRatio } from 'react-native';
import { DefaultTheme as DefaultPaperTheme, MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';
import { components } from './components';
import { fonts } from './fonts';
import { icons } from './icons';


export const BASE_SCREEN_WIDTH = 375;

type ColorsType = typeof colors;
type FontsType = typeof fonts;
type IconsType = typeof icons;
type ComponentsType = typeof components;

export type ThemeType = typeof DefaultPaperTheme & {
  colors: ColorsType,
  fonts: FontsType,
  icons: IconsType,
  components: ComponentsType
};

const LightTheme = {
  ...MD3LightTheme,
  icons: icons,
  colors: colors,
  fonts: fonts,
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
      case 'radius':
        if (typeof value === 'number') {
          parent[key] = value < 1 ? value * BASE_SCREEN_WIDTH * scale : value * scale;
        }
        // } else if (typeof value === 'string' && value.endsWith('%')) {
        //   const percentage = parseFloat(value) / 100;
        //   const newRadius = percentage * BASE_SCREEN_WIDTH* scale;
        //   parent[key] = newRadius as number;
        // } else {
        //   // parent[key] = value;
        // }
        break;
      case 'lineHeight':
      case 'iconSize':
      case 'thickness':
        parent[key] = value * scale;
        break;
      default:
        break;
    }
  });

  return adjustedTheme;
}

export const DefaultTheme = LightTheme;