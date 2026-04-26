import { MD3LightTheme } from 'react-native-paper';





const colors = {
  ...MD3LightTheme.colors,
  primary: 'rgb(56, 107, 1)',
  secondary: "rgb(87, 98, 74)",

}

const fonts = {
  ...MD3LightTheme.fonts,
  labelLarge: {
    ...MD3LightTheme.fonts.labelLarge,
    fontSize: 24,
    fontWeight: "bold",
    fontColor: colors.primary,
  },
  labelMedium: {
    ...MD3LightTheme.fonts.labelMedium,
    fontSize: 14,
    fontWeight: "normal",
    fontColor: colors.secondary,
  },
}

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
  }

export const PaperTheme = {
  ...MD3LightTheme,
  colors: colors,
  fonts: fonts,
  components: components,
};
