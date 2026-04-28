import { colors } from './colors';


export const icons = {
  iconSize: 24,
  home: { source: 'home-outline', color: colors.primary },
  system: { source: 'home-battery-outline' },
  battery: {
    unknown: { source: 'battery-unknown', color: colors.onSurface },
    alert: { source: 'battery-alert', color: colors.error },
    high: { source: 'battery-high', color: colors.ok },
    medium: { source: 'battery-medium', color: colors.ok },
    low: { source: 'battery-low', color: colors.warning },
    empty: { source: 'battery-outline', color: colors.error },
    charging: {
      unknown: { source: 'battery-unknown', color: colors.onSurface },
      alert: { source: 'battery-alert', color: colors.error },
      high: { source: 'battery-charging-high', color: colors.ok },
      medium: { source: 'battery-charging-medium', color: colors.ok },
      low: { source: 'battery-charging-low', color: colors.warning },
      empty: { source: 'battery-charging-outline', color: colors.error },
    },
  },
  deltaV: {
    high: { source: 'alert-outline', color: colors.error },
    medium: { source: 'alert-outline', color: colors.warning },
    low: { source: 'delta', color: colors.ok },
    unknown: { source: 'delta', color: colors.onSurface },
  },
  connectionState: {
    connected: { source: 'stop', color: colors.primary },
    connecting: { source: 'progress-clock', color: colors.primary },
    disconnected: { source: 'refresh', color: colors.primary },
    error: { source: 'progress-alert', color: colors.error },
    unknown: { source: 'progress-question', color: colors.warning },
  },
  lastSeen: {
    recent: { source: 'clock-check-outline', color: colors.ok },
    moderate: { source: 'clock-time-five-outline', color: colors.warning },
    old: { source: 'clock-time-ten-outline', color: colors.warning },
    never: { source: 'clock-alert-outline', color: colors.error },
    unknown: { source: 'progress-alert', color: colors.onSurface },
  },
  favorite: {
    true: {
      source: 'heart',
      color: colors.onSurface,
    },
    false: {
      source: 'heart-outline',
      color: colors.onSurface,
    },
  },
};
