import React from "react";
import { StyleSheet } from "react-native";
import { useTheme } from 'react-native-paper';

import { PaperTheme } from "@/util/paper-theme";

// import CircularProgress from "react-native-circular-progress-indicator";

export interface GaugeProps {
  value?: number;
  maxValue?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  title?: string;
  radius?: number;
  thickness?: number;
}

export const Gauge = (props: GaugeProps) => {
  const {
    value,
    maxValue = 100,
    valuePrefix = undefined,
    valueSuffix = undefined,
    title,
    radius = 25,
    thickness = 4,
  } = props;

  const theme = useTheme() as typeof PaperTheme;
  const formattedPrefix = valuePrefix ?? "";
  const formattedSuffix = valueSuffix ?? "";

  const progressFormatter = React.useCallback((v: number) => {
    'worklet';
    return `${formattedPrefix}${Math.round(v)}${formattedSuffix}`;
  }, [formattedPrefix, formattedSuffix]);

  return (
    // <CircularProgress
    //   value={value ? Math.min(value, maxValue) : 0}
    //   progressFormatter={progressFormatter}
    //   maxValue={maxValue}
    //   title={title}
    //   radius={radius}
    //   activeStrokeWidth={thickness}
    //   inActiveStrokeWidth={thickness}
    //   activeStrokeColor={theme.colors.primary}
    //   activeStrokeSecondaryColor={theme.colors.secondary}
    //   duration={300}
    //   // titleStyle={theme.components?.Gauge?.title}
    //   // subtitleStyle={theme.components.Gauge.subtitle}
    //   // progressValueStyle={theme.components.Gauge.value}
    //   rotation={240}
    // />

    <></>
  );
}


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
