import React from "react";
import { useTheme } from "react-native-paper";
import { Svg, Text } from 'react-native-svg';


// import CircularProgress from "react-native-circular-progress-indicator";


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
  strokeColor?: string;
  textColor?: string;
  fontFamily?: string;
}

export const Gauge = (props: GaugeProps) => {
  const theme = useTheme();

  const {
    value,
    maxvalue = 1,
    valueprefix = undefined,
    valuesuffix = undefined,
    title,
    radius = 25,
    thickness = 4,
    startAngle = 160,
    endAngle = 20,
    strokeColor = theme.colors.primary,
    textColor = theme.colors.onSurface,
    fontFamily = theme.fonts.bodyMedium.fontFamily,
  } = props;

  const valueAsPercentage = value ? value / maxvalue : 0;


  const sweep = subtractDegrees(endAngle, startAngle);
  const valueEndAngle = addDegrees(startAngle, sweep * valueAsPercentage);

  // Center coordinates based on radius to ensure no clipping
  const padding = thickness / 2 + 2; // Add a small buffer for stroke width
  const size = (radius + padding) * 2;
  const cx = radius + padding;
  const cy = radius + padding;

  // Scaling factors for text based on radius
  const valueFontSize = radius * 0.4;
  const titleFontSize = radius * 0.25;

  return (
    <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`} {...props}>

      <Arc cx={cx} cy={cy} r={radius} startAngle={startAngle} endAngle={endAngle} stroke={strokeColor} strokeWidth={thickness} strokeOpacity={0.2} />
      <Arc cx={cx} cy={cy} r={radius} startAngle={startAngle} endAngle={valueEndAngle} stroke={strokeColor} strokeWidth={thickness} />

      <Text
        x={cx}
        y={cy - radius * 0.1}
        fontSize={valueFontSize}
        fill={textColor}
        fontFamily={fontFamily}
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {valueprefix}{value ?? "?"}{valuesuffix}
      </Text>

      {title && (
        <Text
          x={cx}
          y={cy + radius * 0.45}
          fontSize={titleFontSize}
          fill={textColor}
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

  console.log(`Drawing arc from ${startAngle} to ${endAngle} (${subtractDegrees(endAngle, startAngle)} degrees)`);

  const sx = cx + r * Math.cos((startAngle * Math.PI) / 180);
  const sy = cy + r * Math.sin((startAngle * Math.PI) / 180);

  const ex = cx + r * Math.cos((endAngle * Math.PI) / 180);
  const ey = cy + r * Math.sin((endAngle * Math.PI) / 180);

  const largeArcFlag = subtractDegrees(endAngle, startAngle) > 180 ? 1 : 0;
  const sweepFlag = 1; // Clockwise

  return (
    <path d={`M${sx},${sy} A${r},${r} 0 ${largeArcFlag},${sweepFlag} ${ex},${ey}`}
      fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeOpacity={strokeOpacity} />
  );
}