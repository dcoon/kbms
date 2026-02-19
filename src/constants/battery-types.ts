export interface BatteryData {
  soc: number; // State of Charge (0-100%)
  voltage: number; // Volts (V)
  current: number; // Amperes (A)
  temperature: number; // Celsius (°C)
  capacity: number; // Amp-hours (Ah)
  cycles: number; // Charge cycles
  status: 'Healthy' | 'Warning' | 'Critical';
}

export const MOCK_BATTERY_DATA: BatteryData = {
  soc: 85,
  voltage: 13.2,
  current: -2.5, // Negative means discharging
  temperature: 24,
  capacity: 100,
  cycles: 45,
  status: 'Healthy',
};
