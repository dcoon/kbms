import { colors } from './colors';
import { fonts } from './fonts';


const DEFAULT_MARGINS = {
  margin: 5,
  marginHorizontal: 5,
  marginVertical: 5,
  marginTop: 5,
  marginBottom: 5,
  marginLeft: 5,
  marginRight: 5,
};

const gaugeStyleDefault = {
  radius: 0.1,
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
export const components = {
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
      radius: 0.40,
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
      margin: DEFAULT_MARGINS.margin,
      padding: DEFAULT_MARGINS.margin,
    },
    Title: {
      style: {
        marginHorizontal: DEFAULT_MARGINS.marginHorizontal,
      },
      leftStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: DEFAULT_MARGINS.marginLeft,
      },
      titleStyle: {
        fontSize: fonts.titleSmall.fontSize,
        fontWeight: 'bold',
        marginLeft: DEFAULT_MARGINS.marginLeft,
        alignItems: 'baseline',
      },
      rightStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginRight: DEFAULT_MARGINS.marginRight,
        columnGap: 0,
      },
    },
    Content: {
      style: {
        // flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: DEFAULT_MARGINS.marginHorizontal,
        // marginBottom: DEFAULT_MARGINS.marginBottom,
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
      borderColor: colors.onSurface, // Green border for Chips
      borderWidth: 1,
    },
    textStyle: {
      color: colors.onSurface, // Green text for Chips
      fontSize: 12,
    },
  },
  valueChip: {
    style: {
      alignItems: 'center',
      flexDirection: 'column',
      // rowGap: 1
    },
    titleStyle: {
      color: colors.onSurface, // Green text for Chips
      fontSize: fonts.labelSmall.fontSize,
    },
    valueStyle: {
      color: colors.onSurface, // Green text for Chips
      fontSize: fonts.titleMedium.fontSize,
    },
  },
  section: {
    headerStyle: {
      // paddingVertical: DEFAULT_MARGINS.marginVertical,
      paddingHorizontal: DEFAULT_MARGINS.marginHorizontal,
      backgroundColor: colors.background, // Light gray background for sections
      // borderRadius: 5,
      marginVertical: DEFAULT_MARGINS.marginVertical * 2,
    },
    contentStyle: {
      // marginTop: DEFAULT_MARGINS.marginTop,
      // marginBottom: DEFAULT_MARGINS.marginBottom,
      // backgroundColor: colors.backdrop, // Light gray background for section contents
      // borderRadius: 5,
      // padding: DEFAULT_MARGINS.margin,
    },
  },
};
