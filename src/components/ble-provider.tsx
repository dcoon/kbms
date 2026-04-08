import { BLEService, BLEServiceInterface, isBluetoothAvailable } from '@/services/ble-service';
import { BLEServiceMock } from '@/services/ble-service-mock';
import React, { createContext, useContext, useState } from 'react';
import { EventBus } from './event-bus-provider';
export { Device } from '@/services/ble-service'; // Re-export Device type for convenience

// const AppContext = createContext(defaultValue); // Default value is optional
const BleContext = createContext<BLEServiceInterface | null>(null);

export const useBleContext = () => useContext(BleContext);

export interface BleProviderProps {
    children: React.ReactNode;
    eventBus: EventBus;
}

function getBleService(eventBus: EventBus): BLEServiceInterface {

  const ble = isBluetoothAvailable() ? BLEService() : BLEServiceMock();
  ble.setEventBus(eventBus);
  return ble;
}

export const BleProvider = ({ children, eventBus }: BleProviderProps) => {


  // const ble = isBluetoothAvailable() ? BLEService() : BLEServiceMock()

  const bleService = getBleService(eventBus);
  const [ble, setBle] = useState<BLEServiceInterface>(bleService);


  return (
    <BleContext.Provider value={ble} >
      {children}
    </BleContext.Provider>
  );
};