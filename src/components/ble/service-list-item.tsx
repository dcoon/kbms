
import { List } from '@/components/list/list-item';
import React from 'react';
import { Service } from 'react-native-ble-plx';

type OnServicePress = (Service: Service) => void;

interface ServiceListItemProps {
  service: Service | undefined;
  onServicePress?: OnServicePress;
}


  export function ServiceListItem({ service, onServicePress }: ServiceListItemProps) {  
    
    return (
    <List.Item
      title={service?.uuid || ""}
      description={String(service?.id) || ""}
      icon="wrench-outline"
      value={service?.isPrimary || false}
      onPress={() => { onServicePress?.(service as Service) }}
    />
  );
  }
