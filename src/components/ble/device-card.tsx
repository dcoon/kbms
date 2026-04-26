import { Device } from '@/services/ble/ble-types';
import React from 'react';
import { View } from 'react-native';
import { Card } from 'react-native-paper';
import { RssiIcon } from './ble';

interface DeviceCardProps {
  device: Device | undefined;
  title?: string | null;
  subtitle?: string;
      children?: React.ReactNode;
  
}

/**
 * DeviceCard component to display human-readable properties of a BLE Device.
 * 
 * @param device - The Device object from react-native-ble-plx (or a Partial for testing).
 * @param onPress - Optional callback when the card is pressed.
 */
export function DeviceCard ({ device, title = device?.name, subtitle = device?.id, children }: DeviceCardProps)  {

  const DeviceCardLeft = () => (
    <View>
    </View>
  );

  const DeviceCardRight = () => {

    return (
      <View>
        <RssiIcon rssi={device?.rssi}/>
      </View>
    )
  };

  


  return (
    <Card mode='contained'>
      <Card.Title
        title={title}
        subtitle={subtitle}
        // left={DeviceCardLeft}
        right={DeviceCardRight}
      />
      {children}
    </Card>
  )
}
