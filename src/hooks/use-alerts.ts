import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { BatteryData } from '../constants/battery-types';
import { DEFAULT_THRESHOLDS, ActiveAlert, AlertType } from '../constants/alert-thresholds';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useAlerts(batteryData: BatteryData) {
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const lastAlertTimestamps = useRef<Record<AlertType, number>>({} as Record<AlertType, number>);

  const triggerNotification = useCallback(async (type: AlertType, title: string, body: string) => {
    const now = Date.now();
    // Cooldown: only send same alert type once every 5 minutes
    if (lastAlertTimestamps.current[type] && now - lastAlertTimestamps.current[type] < 300000) {
      return;
    }

    lastAlertTimestamps.current[type] = now;
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // immediate
    });
  }, []);

  useEffect(() => {
    const newAlerts: ActiveAlert[] = [];
    const now = Date.now();

    // Voltage Checks
    if (batteryData.voltage < DEFAULT_THRESHOLDS.minVoltage) {
      const msg = `Low Voltage: ${batteryData.voltage}V (Limit: ${DEFAULT_THRESHOLDS.minVoltage}V)`;
      newAlerts.push({ type: 'VOLTAGE_LOW', message: msg, timestamp: now, severity: 'critical' });
      triggerNotification('VOLTAGE_LOW', 'Critical Battery Alert', msg);
    } else if (batteryData.voltage > DEFAULT_THRESHOLDS.maxVoltage) {
      const msg = `High Voltage: ${batteryData.voltage}V (Limit: ${DEFAULT_THRESHOLDS.maxVoltage}V)`;
      newAlerts.push({ type: 'VOLTAGE_HIGH', message: msg, timestamp: now, severity: 'warning' });
      triggerNotification('VOLTAGE_HIGH', 'Battery Warning', msg);
    }

    // SOC Checks
    if (batteryData.soc < DEFAULT_THRESHOLDS.minSoc) {
      const msg = `Low SOC: ${batteryData.soc}% (Limit: ${DEFAULT_THRESHOLDS.minSoc}%)`;
      newAlerts.push({ type: 'SOC_LOW', message: msg, timestamp: now, severity: 'warning' });
      triggerNotification('SOC_LOW', 'Battery Warning', msg);
    }

    // Temperature Checks
    if (batteryData.temperature > DEFAULT_THRESHOLDS.maxTemperature) {
      const msg = `High Temperature: ${batteryData.temperature}°C (Limit: ${DEFAULT_THRESHOLDS.maxTemperature}°C)`;
      newAlerts.push({ type: 'TEMP_HIGH', message: msg, timestamp: now, severity: 'critical' });
      triggerNotification('TEMP_HIGH', 'Critical Temperature Alert', msg);
    }

    setActiveAlerts(newAlerts);
  }, [batteryData, triggerNotification]);

  return { activeAlerts };
}
