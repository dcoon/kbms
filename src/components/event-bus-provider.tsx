import React, { createContext, useContext, useState } from 'react';
import { Subject } from 'rxjs';
// export { Device } from '@/services/ble-service'; // Re-export Device type for convenience


export enum EventType {
    DeviceScanned = 'DeviceScanned',
    DeviceConnected = 'DeviceConnected',
    DeviceDisconnected = 'DeviceDisconnected',
    BleStateChanged = 'BleStateChanged',
    BatteryUpdate = 'BatteryUpdate',
    SettingsChanged = 'SettingsChanged',
    // Add more event types as needed
}

export type Event = {
    type: EventType;
    data: any;
}

export class EventDefault implements Event {
    type: EventType;
    data: any;

    constructor(type: EventType, data: any) {
        this.type = type;
        this.data = data;
    }
}           

export type EventBus = Subject<Event>;

const EventBusContext = createContext<EventBus>(null as any);

export const useEventBusContext = () => useContext<EventBus>(EventBusContext);


export interface EventBusProviderProps {
    eventBus: EventBus;
    children: React.ReactNode;
}

export const EventBusProvider = ({ eventBus, children }: EventBusProviderProps) => {
    
    const [eventBusState, setEventBusState] = useState<EventBus>(new Subject<Event>());


  return (
    <EventBusContext.Provider value={eventBusState} >
      {children}
    </EventBusContext.Provider>
  );
};