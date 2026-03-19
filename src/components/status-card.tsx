import { Icon, List, Text, useTheme } from 'react-native-paper';

import React from 'react';
import { DimensionValue } from 'react-native';

interface StatusCardProps {
  label: string;
  value: string | number | undefined | null;
  minValue?: number;
  maxValue?: number;
  unit?: string;
  icon?: string;
  color: string;
}

export function StatusCard({ label, value, unit, icon, color, minValue=0, maxValue }: StatusCardProps) {
  const theme = useTheme();


  let showProgressBar = false;
  let progressBarValue: DimensionValue = 0;

  if(minValue !== undefined && maxValue !== undefined && value !== undefined ) {   
    showProgressBar = true;
    const v = Number(value);
    const percentage = (v - minValue) / (maxValue - minValue) * 100;

    progressBarValue = `${percentage}%`; //v  / (maxValue - minValue);
  }

  function LeftContent() {
    return icon ? (
        <Icon source={icon} size={20} color={color} />
    ) : null;
  }
  
  return (

    <List.Item title={label}  left={() =>LeftContent()}  right ={() => <Text>{value}</Text>}  />
    
  );
}
