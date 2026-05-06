import { colors } from './colors';


export const icons = {
  iconSize: 24,
  alert: { source: 'alert-circle-outline', color: colors.warning },
  ok: { source: 'check-circle-outline', color: colors.ok },
  home: { source: 'home-outline', color: colors.primary },
  system: { source: 'home-battery-outline' },
  delete: { source: 'delete', color: colors.onSurface },
  log: { source: 'file-code-outline', color: colors.onSurface },
  demo: { source: 'monitor-dashboard', color: colors.onSurface },
  share: { source: 'share', color: colors.onSurface },
  battery: {
    soc: {
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
    lastSeen: {
      recent: { source: 'clock-check-outline', color: colors.ok },
      moderate: { source: 'clock-time-five-outline', color: colors.warning },
      old: { source: 'clock-time-ten-outline', color: colors.warning },
      never: { source: 'clock-alert-outline', color: colors.error },
      unknown: { source: 'progress-alert', color: colors.onSurface },
    },
    status: {
      ok: { source: 'check', color: colors.ok },
      alert: { source: 'alert', color: colors.error },
    },
  },
  connectionState: {
    connected: { source: 'stop', color: colors.primary },
    connecting: { source: 'progress-clock', color: colors.primary },
    disconnected: { source: 'refresh', color: colors.primary },
    error: { source: 'progress-alert', color: colors.error },
    unknown: { source: 'progress-question', color: colors.warning },
  },
  favorite: {
    true: {
      source: 'heart-remove',
      color: colors.onSurface,
    },
    false: {
      source: 'heart-plus-outline',
      color: colors.onSurface,
    },
    unknown: {
      source: 'heart-off-outline',
      color: colors.onSurface,
    },
  },
  rssi: {
    excellent: { source: 'signal-cellular-4-bar', color: colors.ok },
    good: { source: 'signal-cellular-3-bar', color: colors.ok },
    fair: { source: 'signal-cellular-2-bar', color: colors.warning },
    weak: { source: 'signal-cellular-1-bar', color: colors.error },
    unknown: { source: 'signal-cellular-outline', color: colors.onSurface },
  },
  scanning: {
    refresh: { source: 'refresh', color: colors.onSurface },
    stop: { source: 'stop', color: colors.onSurface },
  },
  settings: {
    app: {
      info: { source: 'information', color: colors.onSurface },
      update: { source: 'update', color: colors.onSurface },
      updated: { source: 'calendar-range', color: colors.onSurface },
      version: { source: 'tag', color: colors.onSurface },
      build: { source: 'tag', color: colors.onSurface },
      license: { source: 'file-document', color: colors.onSurface },
      contact: { source: 'lifebuoy', color: colors.onSurface },
      id: { source: 'identifier', color: colors.onSurface },
      name: { source: 'tag', color: colors.onSurface },
      channel: { source: 'tag', color: colors.onSurface },
      runtime: { source: 'tag', color: colors.onSurface },
      
    },

  },
};
