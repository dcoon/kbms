import { MD3LightTheme, type MD3Theme } from 'react-native-paper';




/**
 * A simple light theme for React Native Paper.
 * Important elements use 'green' (#2e7d32).
 * Unimportant elements use 'gray' (#757575).
 */
export type AppTheme = MD3Theme & {
  components: {
    Snackbar: {
      style: {
        backgroundColor: string;
      };
      contentStyle: {
        color: string;
      };
    };
    Gauge: {
      title: {
        color: string;
        fontSize: number;
      };
      subtitle: {
        color: string;
        fontSize: number;
      };
      value: {
        color: string;
        fontSize: number;
      };
    };
    Card: {
      theme: {
        roundness: number;
      };
      style: {
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
      };
      Title: {
        style: {
          marginHorizontal: number;
        };
        leftStyle: {
          marginRight: number;
          justifyContent: 'center';
          alignItems: 'center';
        };
        titleStyle: {
          fontSize: number;
          fontWeight: 'bold';
          marginLeft: number;
        };
      };
      Content: {
        style: {
          flexDirection: 'row';
          justifyContent: 'space-between';
          alignItems: 'center';
          marginHorizontal: number;
          marginBottom: number;
        };
      };
    };
  };
};

export const PaperTheme = {
  ...MD3LightTheme,

  "colors": {
    "primary": "rgb(56, 107, 1)",
    "onPrimary": "rgb(255, 255, 255)",
    "primaryContainer": "rgb(183, 244, 129)",
    "onPrimaryContainer": "rgb(13, 32, 0)",
    "secondary": "rgb(87, 98, 74)",
    "onSecondary": "rgb(255, 255, 255)",
    "secondaryContainer": "rgb(218, 231, 201)",
    "onSecondaryContainer": "rgb(21, 30, 12)",
    "tertiary": "rgb(56, 102, 100)",
    "onTertiary": "rgb(255, 255, 255)",
    "tertiaryContainer": "rgb(187, 236, 233)",
    "onTertiaryContainer": "rgb(0, 32, 31)",
    "error": "rgb(186, 26, 26)",
    "onError": "rgb(255, 255, 255)",
    "errorContainer": "rgb(255, 218, 214)",
    "onErrorContainer": "rgb(65, 0, 2)",
    "background": "rgb(253, 253, 245)",
    "onBackground": "rgb(26, 28, 24)",
    "surface": "rgb(253, 253, 245)",
    "onSurface": "rgb(26, 28, 24)",
    "surfaceVariant": "rgb(224, 228, 214)",
    "onSurfaceVariant": "rgb(68, 72, 62)",
    "outline": "rgb(116, 121, 109)",
    "outlineVariant": "rgb(196, 200, 186)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(47, 49, 44)",
    "inverseOnSurface": "rgb(241, 241, 234)",
    "inversePrimary": "rgb(156, 215, 105)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(243, 246, 233)",
      "level2": "rgb(237, 241, 226)",
      "level3": "rgb(231, 237, 218)",
      "level4": "rgb(229, 236, 216)",
      "level5": "rgb(225, 233, 211)"
    },

    "surfaceDisabled": "rgba(26, 28, 24, 0.12)",
    "onSurfaceDisabled": "rgba(26, 28, 24, 0.38)",
    "backdrop": "rgba(45, 50, 40, 0.4)"
  },
  fonts: {
    ...MD3LightTheme.fonts,
    labelLarge: {
      ...MD3LightTheme.fonts.labelLarge,
      fontSize: 18,
      fontWeight: '700',
    },
    labelMedium: {
      ...MD3LightTheme.fonts.labelMedium,
      fontSize: 14,
      fontWeight: '700',
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
      title: {
        color: '#5B635F', // Dark text for title
        fontSize: 12,
        // fontWeight: 'bold',
      },
      subtitle: {
        color: '#5B635F', // Dark text for subtitle
        fontSize: 10,
      },
      value: {
        color: '#5B635F', // Dark text for value
        fontSize: 16,
        // fontWeight: 'bold',
      },
    },
    Card: {
      theme: {
        roundness: 0, // Square corners for Card
      },
      style: {
        backgroundColor: 'rgb(253, 253, 245)', // White background for Card
        borderColor: 'rgb(253, 253, 245)', // Green border for Card
        borderWidth: 0,
      },
      Title: {
        style: {
          marginHorizontal: 16,
        },
        leftStyle: {
          marginRight: 0,
          justifyContent: 'center',
          alignItems: 'center',
        },
        titleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          marginLeft: 0,
        },
      },
      Content: {
        style: {
          // flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginHorizontal: 16,
          marginBottom: 10,
        },
      },
    },
  },
} satisfies AppTheme;
