import { uilog as log } from "@/services/log/log-service";
import { PaperTheme } from "@/util/paper-theme";
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
  radius?: number;
  thickness?: number;
  startAngle?: number;
  endAngle?: number;
  strokecolor?: string;
  backgroundStrokeColor?: string;
  textColor?: string;
  fontFamily?: string;
}

export const Gauge = (props: GaugeProps) => {
  const LOG_PREFIX = LOG_SRC + ": Gauge";
  const theme = useTheme() as typeof PaperTheme;

  const {
    value,
    maxvalue = 1,
    valueprefix = undefined,
    valuesuffix = undefined,
    title,
    radius = 25,
    thickness = radius * 0.15,
    startAngle = 170,
    endAngle = 10,
    strokecolor: strokecolor = theme.colors.primary,
    backgroundStrokeColor = theme.colors.primary,
    textColor = theme.colors.onSurface,
    fontFamily = theme.fonts.bodyMedium.fontFamily,
  } = props;

  const valueAsPercentage = value ? value / maxvalue : 0;


  const sweep = subtractDegrees(endAngle, startAngle);
  const valueEndAngle = addDegrees(startAngle, sweep * valueAsPercentage);

  // Center coordinates based on radius to ensure no clipping
  const padding = thickness / 2 + 2; // Add a small buffer for stroke width
  const sizex = (radius + padding) * 2;
  const sizey = (radius * 1.5 + padding);
  const cx = radius + padding;
  const cy = radius + padding;

  // Scaling factors for text based on radius
  const valueFontSize = radius * 0.55;
  const titleFontSize = radius * 0.25;

  log.debug(LOG_PREFIX, "Rendering Gauge with props: startAngle, endAngle, valueEndAngle, value, maxvalue, valueAsPercentage", startAngle, endAngle, valueEndAngle, value, maxvalue, valueAsPercentage);


  return (
    <Svg height={sizey} width={sizex} viewBox={`0 0 ${sizex} ${sizey}`} {...props}>

      {/* <rect x={0} y={0} width={sizex} height={sizey} stroke="red" fill="none" /> */}
      <Arc cx={cx} cy={cy} r={radius} 
      startAngle={startAngle} endAngle={endAngle} stroke={backgroundStrokeColor} strokeWidth={thickness} strokeOpacity={0.2} />
      <Arc cx={cx} cy={cy} r={radius} 
      startAngle={startAngle} endAngle={valueEndAngle} stroke={strokecolor} strokeWidth={thickness} />

      <Text
        x={cx}
        y={cy - radius * 0.3}
        fontSize={theme.fonts.labelLarge.fontSize}
        fill={theme.fonts.labelLarge.fontColor}
        fontFamily={fontFamily}
        fontWeight={theme.fonts.labelLarge.fontWeight}
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {valueprefix}{value ?? ""}{valuesuffix}
      </Text>

      {title && (
        <Text
          x={cx}
          y={cy + radius * 0.3}
          fontSize={theme.fonts.labelMedium.fontSize}
          fill={theme.fonts.labelMedium.fontColor}
          fontFamily={fontFamily}
          textAnchor="middle"
        >
          {title}
        </Text>
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

  // console.log(`Drawing arc from ${startAngle} to ${endAngle} (${subtractDegrees(endAngle, startAngle)} degrees)`);

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