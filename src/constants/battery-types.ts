export interface BatteryData {
  soc: number; // State of Charge (0-100%)
  voltage: number; // Volts (V)
  current: number; // Amperes (A)
  temperature: number; // Celsius (°C)
  capacity: number; // Amp-hours (Ah)
  cycles: number; // Charge cycles
  status: 'Healthy' | 'Warning' | 'Critical';
}
