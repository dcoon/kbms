import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeviceCard, DeviceStatus } from '@/components/device-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Mock Data Interfaces
interface SystemState {
  totalVoltage: number;
  totalCurrent: number;
  totalPower: number;
  avgSoc: number;
  bleStatus: 'connected' | 'disconnected' | 'scanning';
}

interface BatteryDevice {
  id: string;
  name: string;
  status: DeviceStatus;
  voltage: number;
  soc: number;
  history: number[];
  signalHistory: number[];
}

const INITIAL_BATTERIES: BatteryDevice[] = [
  {
    id: '1',
    name: 'Main Battery Bank',
    status: 'connected',
    voltage: 52.4,
    soc: 88,
    history: [80, 82, 85, 87, 88],
    signalHistory: [90, 92, 95, 94, 95],
  },
  {
    id: '2',
    name: 'Auxiliary Power',
    status: 'connected',
    voltage: 13.5,
    soc: 95,
    history: [90, 92, 94, 95, 95],
    signalHistory: [60, 65, 70, 72, 75],
  },
];

export default function DashboardScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const [system, setSystem] = useState<SystemState>({
    totalVoltage: 52.4,
    totalCurrent: 12.5,
    totalPower: 655,
    avgSoc: 91,
    bleStatus: 'connected',
  });

  const [batteries, setBatteries] = useState<BatteryDevice[]>(INITIAL_BATTERIES);

  // Mock Data Updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update Batteries
      setBatteries(prev => prev.map(b => {
          if (b.status !== 'connected') return b;
          const vChange = (Math.random() - 0.5) * 0.1;
          const socChange = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          return {
              ...b,
              voltage: Math.max(0, b.voltage + vChange),
              soc: Math.min(100, Math.max(0, b.soc + socChange)),
              history: [...b.history.slice(1), Math.min(100, Math.max(0, b.soc + socChange))],
              signalHistory: [...b.signalHistory.slice(1), Math.min(100, Math.max(0, b.signalHistory[b.signalHistory.length-1] + (Math.random() - 0.5) * 10))]
          };
      }));

      // Update System
      setSystem(prev => {
          // Rough mock recalculations
          const newCurrent = Math.max(0, prev.totalCurrent + (Math.random() - 0.5) * 2);
          return {
            ...prev,
            totalCurrent: newCurrent,
            totalPower: (prev.totalVoltage * newCurrent),
            // bleStatus mock toggle
            bleStatus: Math.random() > 0.98 ? (prev.bleStatus === 'connected' ? 'scanning' : 'connected') : prev.bleStatus
          };
      });

    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const contentPlatformStyle = Platform.select({
    android: {
        paddingTop: insets.top + Spacing.four,
    },
    web: {
      paddingTop: Spacing.six,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle, {paddingBottom: insets.bottom}]}
    >
      <ThemedView style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
            <View>
                <ThemedText type="title">Dashboard</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">Overview</ThemedText>
            </View>
            <View style={[styles.bleStatus, { backgroundColor: system.bleStatus === 'connected' ? 'rgba(0, 122, 255, 0.1)' : theme.backgroundElement }]}>
                <Ionicons 
                    name={system.bleStatus === 'connected' ? "bluetooth" : "bluetooth-outline"} 
                    size={20} 
                    color={system.bleStatus === 'connected' ? "#007AFF" : theme.textSecondary} 
                />
                <ThemedText type="smallBold" style={{color: system.bleStatus === 'connected' ? "#007AFF" : theme.textSecondary}}>
                    {system.bleStatus === 'connected' ? "Connected" : system.bleStatus === 'scanning' ? "Scanning..." : "Disconnected"}
                </ThemedText>
            </View>
        </View>

        {/* System Overview Cards */}
        <View style={styles.overviewGrid}>
            <ThemedView type="backgroundElement" style={styles.overviewCard}>
                <Ionicons name="flash-outline" size={24} color="#FF9500" />
                <ThemedText type="defaultSemiBold" style={{marginTop: Spacing.one}}>{system.totalPower.toFixed(0)} W</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">Power</ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.overviewCard}>
                <Ionicons name="speedometer-outline" size={24} color="#34C759" />
                <ThemedText type="defaultSemiBold" style={{marginTop: Spacing.one}}>{system.totalCurrent.toFixed(1)} A</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">Current</ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.overviewCard}>
                 <Ionicons name="battery-charging-outline" size={24} color="#007AFF" />
                <ThemedText type="defaultSemiBold" style={{marginTop: Spacing.one}}>{system.avgSoc}%</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">Avg SoC</ThemedText>
            </ThemedView>
             <ThemedView type="backgroundElement" style={styles.overviewCard}>
                 <Ionicons name="pulse-outline" size={24} color="#FF3B30" />
                <ThemedText type="defaultSemiBold" style={{marginTop: Spacing.one}}>{system.totalVoltage.toFixed(1)} V</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">Voltage</ThemedText>
            </ThemedView>
        </View>

        {/* Connected Batteries Section */}
        <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Connected Batteries</ThemedText>
             <Ionicons name="ellipsis-horizontal-circle-outline" size={24} color={theme.textSecondary} />
        </View>

        <View style={styles.batteryList}>
            {batteries.map(device => (
                <DeviceCard 
                    key={device.id}
                    {...device}
                />
            ))}
        </View>

      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
  },
  bleStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
      paddingVertical: Spacing.half,
      paddingHorizontal: Spacing.two,
      borderRadius: Spacing.four,
  },
  overviewGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.three,
      marginBottom: Spacing.five,
  },
  overviewCard: {
      flex: 1,
      minWidth: '40%',
      padding: Spacing.three,
      borderRadius: Spacing.four,
      alignItems: 'flex-start',
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.three,
  },
  batteryList: {
      gap: Spacing.three,
  }
});