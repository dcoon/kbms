import { BLEService, BLEServiceInterface, isBluetoothAvailable } from '@/services/ble-service';
import { BLEServiceMock } from '@/services/ble-service-mock';
import React, { createContext, useContext, useState } from 'react';
export { Device } from '@/services/ble-service'; // Re-export Device type for convenience

// const AppContext = createContext(defaultValue); // Default value is optional
const BleContext = createContext<BLEServiceInterface | null>(null);

export const useBleContext = () => useContext(BleContext);

export const BleProvider = ({ children }: { children: React.ReactNode }) => {
const [ble, setBle] = useState<BLEServiceInterface>(isBluetoothAvailable() ? BLEService() : BLEServiceMock());



  return (
    <BleContext.Provider value={ble} >
      {children}
    </BleContext.Provider>
  );
};