import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusCard } from '../components/status-card';
import { BatteryData, MOCK_BATTERY_DATA } from '../constants/battery-types';
import { useBLE } from '../hooks/use-ble';
import { useAlerts } from '../hooks/use-alerts';

const { width } = Dimensions.get('window');

function AlertBar({ alerts }: { alerts: any[] }) {
  if (alerts.length === 0) return null;

  return (
    <View style={styles.alertContainer}>
      {alerts.map((alert, index) => (
        <View key={index} style={[styles.alertItem, alert.severity === 'critical' ? styles.alertCritical : styles.alertWarning]}>
          <Ionicons name={alert.severity === 'critical' ? 'alert-circle' : 'warning'} size={20} color="#fff" />
          <Text style={styles.alertText}>{alert.message}</Text>
        </View>
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  const { connectedDevice, batteryMetrics } = useBLE();
  const [batteryData, setBatteryData] = useState<BatteryData>(MOCK_BATTERY_DATA);
  const { activeAlerts } = useAlerts(batteryData);

  // Fallback simulation when disconnected
  useEffect(() => {
    if (connectedDevice) {
      setBatteryData(prev => ({
        ...prev,
        soc: batteryMetrics.soc > 0 ? batteryMetrics.soc : prev.soc,
        status: activeAlerts.some(a => a.severity === 'critical') ? 'Critical' : activeAlerts.length > 0 ? 'Warning' : 'Healthy',
      }));
      return;
    }

    const interval = setInterval(() => {
      setBatteryData(prev => ({
        ...prev,
        voltage: +(prev.voltage + (Math.random() * 0.1 - 0.05)).toFixed(2),
        current: +(prev.current + (Math.random() * 0.5 - 0.25)).toFixed(2),
        soc: Math.max(0, Math.min(100, +(prev.soc + (Math.random() * 0.1 - 0.05)).toFixed(1))),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [connectedDevice, batteryMetrics, activeAlerts]);

  const getStatusColor = (status: BatteryData['status']) => {
    switch (status) {
      case 'Healthy': return '#4ade80'; // Emerald-400
      case 'Warning': return '#fbbf24'; // Amber-400
      case 'Critical': return '#ef4444'; // Red-500
      default: return '#9ca3af'; // Gray-400
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.title}>Battery Monitor</Text>
          </View>
          <Link href="/devices" asChild>
            <TouchableOpacity style={styles.deviceButton}>
              <Ionicons name="bluetooth" size={24} color="#208AEF" />
            </TouchableOpacity>
          </Link>
        </View>

        <AlertBar alerts={activeAlerts} />

        {/* Main SOC Card */}
        <View style={styles.socCard}>
          <View style={styles.socHeader}>
            <Text style={styles.socLabel}>State of Charge</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(batteryData.status) + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(batteryData.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(batteryData.status) }]}>{batteryData.status}</Text>
            </View>
          </View>
          
          <View style={styles.socValueContainer}>
            <Text style={styles.socValue}>{batteryData.soc}</Text>
            <Text style={styles.percentSymbol}>%</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${batteryData.soc}%`, backgroundColor: getStatusColor(batteryData.status) }]} />
          </View>
        </View>

        {/* Grid of Status Cards */}
        <View style={styles.grid}>
          <StatusCard
            label="Voltage"
            value={batteryData.voltage}
            unit="V"
            icon="flash"
            color="#3b82f6"
            style={styles.gridItem}
          />
          <StatusCard
            label="Current"
            value={batteryData.current}
            unit="A"
            icon="swap-horizontal"
            color="#8b5cf6"
            style={styles.gridItem}
          />
          <StatusCard
            label="Temperature"
            value={batteryData.temperature}
            unit="°C"
            icon="thermometer"
            color="#f97316"
            style={styles.gridItem}
          />
          <StatusCard
            label="Capacity"
            value={batteryData.capacity}
            unit="Ah"
            icon="battery-full"
            color="#10b981"
            style={styles.gridItem}
          />
        </View>

        {/* Health Summary Card */}
        <View style={styles.healthCard}>
          <Text style={styles.healthTitle}>Cycle Count</Text>
          <View style={styles.cycleRow}>
            <Ionicons name="refresh-circle" size={32} color="#6366f1" />
            <Text style={styles.cycleValue}>{batteryData.cycles}</Text>
            <Text style={styles.cycleLabel}>Cycles</Text>
          </View>
          <Text style={styles.healthDescription}>
            Your battery is in excellent condition. {batteryData.cycles} cycles is low for this capacity.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  deviceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  socHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  socLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  socValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  socValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  percentSymbol: {
    fontSize: 24,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 60) / 2,
    marginBottom: 20,
  },
  healthCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  cycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cycleValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 12,
  },
  cycleLabel: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 8,
    fontWeight: '500',
  },
  healthDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  alertContainer: {
    marginBottom: 20,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  alertCritical: {
    backgroundColor: '#ef4444',
  },
  alertWarning: {
    backgroundColor: '#fbbf24',
  },
  alertText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: '600',
    flex: 1,
  },
});
