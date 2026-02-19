export interface AlertThresholds {
  minVoltage: number;
  maxVoltage: number;
  minSoc: number;
  maxTemperature: number;
  maxCurrent: number; // Charging current limit
  minCurrent: number; // Discharging current limit (negative)
}

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  minVoltage: 11.5,
  maxVoltage: 14.6,
  minSoc: 20,
  maxTemperature: 50,
  maxCurrent: 50,
  minCurrent: -100,
};

export type AlertType = 'VOLTAGE_LOW' | 'VOLTAGE_HIGH' | 'SOC_LOW' | 'TEMP_HIGH' | 'OVERCURRENT_CHARGE' | 'OVERCURRENT_DISCHARGE';

export interface ActiveAlert {
  type: AlertType;
  message: string;
  timestamp: number;
  severity: 'warning' | 'critical';
}
