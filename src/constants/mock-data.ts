import { BatteryData } from './battery-types';

export const MOCK_BATTERY_DATA: BatteryData = {
  soc: 85,
  voltage: 13.2,
  current: -2.5, // Negative means discharging
  temperature: 24,
  capacity: 100,
  cycles: 45,
  status: 'Healthy',
};

export const MOCK_DEVICES = [
  { 
    id: '1', 
    name: 'Smart Battery A', 
    rssi: -59, 
    lastSeen: Date.now() - 5000,
    manufacturerData: 'e00201020304',
    manufacturerId: 'e002'
  },
  { 
    id: '2', 
    name: 'KiloVault Unit B', 
    rssi: -84, 
    lastSeen: Date.now() - 300000,
    manufacturerData: '5601112233',
    manufacturerId: '5601'
  },
  { 
    id: '3', 
    name: 'Solar Storage X', 
    rssi: -45, 
    lastSeen: Date.now() - 60000,
    manufacturerData: 'e002ffeeddcc',
    manufacturerId: 'e002'
  },
];
