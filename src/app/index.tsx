import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';
import { Text, Card, useTheme, IconButton } from 'react-native-paper';

import { StatusCard } from '../components/status-card';
import { BatteryData } from '../constants/battery-types';
import { MOCK_BATTERY_DATA } from '../constants/mock-data';
import { useBLE } from '../hooks/use-ble';

export default function DashboardScreen() {
  const theme = useTheme();
  const { connectedDevice, batteryMetrics } = useBLE();
  const [batteryData, setBatteryData] = useState<BatteryData>(MOCK_BATTERY_DATA);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulation using mock data
  useEffect(() => {
    if (Device.isDevice && connectedDevice) {
      setBatteryData(prev => ({
        ...prev,
        soc: batteryMetrics.soc > 0 ? batteryMetrics.soc : prev.soc,
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
  }, [connectedDevice, batteryMetrics]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  }, []);

  const getStatusColor = (status: BatteryData['status']) => {
    switch (status) {
      case 'Healthy': return '#34C759';
      case 'Warning': return '#FF9500';
      case 'Critical': return '#FF3B30';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: "Dashboard", headerShown: false }} />
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>WELCOME BACK</Text>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>{Device.isDevice ? 'KiloVault Monitor' : 'KiloVault System'}</Text>
          </View>
          <Link href="/devices" asChild>
            <IconButton icon="bluetooth" iconColor={theme.colors.primary} containerColor={theme.colors.surface} style={{ elevation: 2 }} />
          </Link>
        </View>

        {/* Main SOC Card */}
        <Card style={{ margin: 20, backgroundColor: theme.colors.surface, borderRadius: 24 }} elevation={2}>
          <Card.Content style={{ padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>State of Charge</Text>
              <View style={{ backgroundColor: getStatusColor(batteryData.status) + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text variant="labelSmall" style={{ color: getStatusColor(batteryData.status), fontWeight: 'bold' }}>{batteryData.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 }}>
              <Text style={{ fontSize: 72, fontWeight: '800', color: theme.colors.onSurface }}>{batteryData.soc}</Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>%</Text>
            </View>
            
            <View style={{ height: 12, backgroundColor: theme.colors.surfaceVariant, borderRadius: 6, overflow: 'hidden' }}>
              <View style={{ width: `${batteryData.soc}%`, height: '100%', backgroundColor: getStatusColor(batteryData.status) }} />
            </View>
          </Card.Content>
        </Card>

        {/* Grid of Status Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 8 }}>
          <StatusCard
            label="Voltage"
            value={batteryData.voltage}
            unit="V"
            icon="sf:bolt.fill"
            color="#007AFF"
          />
          <StatusCard
            label="Current"
            value={batteryData.current}
            unit="A"
            icon="sf:arrow.left.and.right.circle.fill"
            color="#5856D6"
          />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 }}>
          <StatusCard
            label="Temperature"
            value={batteryData.temperature}
            unit="°C"
            icon="sf:thermometer.medium"
            color="#FF9500"
          />
          <StatusCard
            label="Capacity"
            value={batteryData.capacity}
            unit="Ah"
            icon="sf:battery.100.bolt"
            color="#34C759"
          />
        </View>

        {/* Health Summary Card */}
        <Card style={{ margin: 20, backgroundColor: theme.colors.surface, borderRadius: 20 }} elevation={1}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>System Health</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: theme.colors.secondaryContainer, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                <Image source="sf:arrow.2.squarepath" contentFit="contain" style={{ width: 24, height: 24, tintColor: theme.colors.secondary }} />
              </View>
              <View>
                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>{batteryData.cycles}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Charge Cycles</Text>
              </View>
            </View>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 20 }}>
              Your battery is in excellent condition. Regular monitoring ensures long-term performance and reliability.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
