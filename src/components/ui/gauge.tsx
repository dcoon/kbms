import { DefaultTheme } from "@/theme/theme";
import React from "react";
import { useTheme } from "react-native-paper";
import { Path, Svg, Text } from 'react-native-svg';

const LOG_SRC = "Gauge";

function normalizeDegrees(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function addDegrees(a: number, b: number) {
  return (a + b) % 360;;
}

function subtractDegrees(a: number, b: number) {
  return (a - b + 360) % 360;
}

export interface GaugeProps {
  value?: number;
  maxvalue?: number;
  valueprefix?: string;
  valuesuffix?: string;
  title?: string;
  variant?: typeof DefaultTheme.components.Gauge.large;
  // radius?: number;
  // thickness?: number;
  // startAngle?: number;
  // endAngle?: number;
  strokecolor?: string;
  backgroundStrokeColor?: string;
  // textColor?: string;
  // fontFamily?: string;
}

export const Gauge = (props: GaugeProps) => {
  const LOG_PREFIX = LOG_SRC + ": Gauge";
  const theme = useTheme() as typeof DefaultTheme;

  const {
    value,
    maxvalue = 1,
    valueprefix = undefined,
    valuesuffix = undefined,
    title,
    variant = theme.components.Gauge.default,
    // radius = theme.components.Gauge.small.radius,
    // thickness = theme.components.Gauge.small.thickness,
    // startAngle = 170,
    // endAngle = 10,
    strokecolor = variant.strokecolor,
    backgroundStrokeColor = strokecolor,
    // textColor = theme.components.Gauge.small.title.color,
    // fontFamily = theme.fonts.default.fontFamily,
  } = props;

  const valueAsPercentage = value ? value / maxvalue : 0;


  const sweep = subtractDegrees(variant.endAngle, variant.startAngle);
  const valueEndAngle = addDegrees(variant.startAngle, sweep * valueAsPercentage);

  // Center coordinates based on radius to ensure no clipping
  const padding = variant.thickness / 2 + 2; // Add a small buffer for stroke width
  const sizex = (variant.radius + padding) * 2;
  const sizey = (variant.radius * 1.5 + padding);
  const cx = variant.radius + padding;
  const cy = variant.radius + padding;

  const valueString = `${valueprefix ?? ""}${value ?? "--"}${valuesuffix ?? ""}`;

  return (
    <Svg height={sizey} width={sizex} viewBox={`0 0 ${sizex} ${sizey}`} {...props}>

      {/* <rect x={0} y={0} width={sizex} height={sizey} stroke="red" fill="none" /> */}
      <Arc cx={cx} cy={cy} r={variant.radius} 
      startAngle={variant.startAngle} endAngle={variant.endAngle} stroke={backgroundStrokeColor} strokeWidth={variant.thickness} strokeOpacity={0.2} />
      <Arc cx={cx} cy={cy} r={variant.radius} 
      startAngle={variant.startAngle} endAngle={valueEndAngle} stroke={strokecolor} strokeWidth={variant.thickness} />

      <Text
        x={cx}
        y={cy - variant.radius * 0.3}
        fontSize={variant.title.font.fontSize}
        fill={strokecolor}
        fontFamily={variant.title.font.fontFamily}
        fontWeight={variant.title.font.fontWeight}
        textAnchor="middle"
        alignmentBaseline="middle"
      >{valueString}</Text>

      {title && (
        <Text
          x={cx}
          y={cy + variant.radius * 0.3}
          fontSize={variant.subtitle.font.fontSize}
          fill={strokecolor}
          fontFamily={variant.subtitle.font.fontFamily}
          fontWeight={variant.subtitle.font.fontWeight}
          textAnchor="middle"
        >{title}</Text>
      )}

    </Svg>
  );

}


interface ArcProps {
  cx: number;
  cy: number;
  r: number;
  startAngle: number;
  endAngle: number;
  stroke: string;
  strokeWidth: number;
  strokeOpacity?: number;
}

const Arc = (props: ArcProps) => {
  const { cx, cy, r, startAngle, endAngle, stroke, strokeWidth, strokeOpacity = 1 } = props;

  if (startAngle === endAngle) {
    return null; // No arc to draw
  }

  const sx = cx + r * Math.cos((startAngle * Math.PI) / 180);
  const sy = cy + r * Math.sin((startAngle * Math.PI) / 180);

  const ex = cx + r * Math.cos((endAngle * Math.PI) / 180);
  const ey = cy + r * Math.sin((endAngle * Math.PI) / 180);

  const largeArcFlag = subtractDegrees(endAngle, startAngle) > 180 ? 1 : 0;
  const sweepFlag = 1; // Clockwise

  return (
    <Path d={`M${sx},${sy} A${r},${r} 0 ${largeArcFlag},${sweepFlag} ${ex},${ey}`}
      fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeOpacity={strokeOpacity} />
  );
}