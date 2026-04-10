import React from "react";
import { StyleSheet } from "react-native";
import { useTheme } from 'react-native-paper';

import { PaperTheme } from "@/util/paper-theme";
import CircularProgress from 'react-native-circular-progress-indicator';

export interface GaugeProps {
  value: number;
  maxValue?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  title?: string;
  radius?: number;
  thickness?: number;
}


/**
 * A gauge chart component for displaying a value (like State of Charge).
 * Assumes Skia has already been initialized by the app-level SkiaProvider.
 */
export const Gauge = (props: GaugeProps) => {
  const {
    value,
    maxValue = 100,
    valuePrefix = undefined,
    valueSuffix = undefined,
    title = "SOC",
    radius = 25,
    thickness = 4,
  } = props;

  const theme = useTheme() as typeof PaperTheme;

  return (
    <CircularProgress
      value={value}
      maxValue={maxValue}
      title={title}
      valuePrefix={valuePrefix}
      valueSuffix={valueSuffix}
      radius={radius}
      activeStrokeWidth={thickness}
      inActiveStrokeWidth={thickness}
      activeStrokeColor={theme.colors.primary}
      activeStrokeSecondaryColor={theme.colors.secondary}
      duration={300}
      titleStyle={theme.components?.Gauge?.centerLabel?.title}
    // dashedStrokeConfig={{
    //   count: 3,
    //   width: 40,
    // }}
    />
  );
};

const styles = StyleSheet.create({
  textContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
  },
  valueText: {
    fontWeight: "bold",
  },
  labelText: {
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: -2,
  },
});
