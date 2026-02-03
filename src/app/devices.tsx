import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeviceCard, DeviceStatus } from '@/components/device-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface DeviceData {
  id: string;
  name: string;
  status: DeviceStatus;
  voltage: number;
  soc: number;
  lastSeen?: string;
  history: number[];
  signalStrength: number; // 0-100
  signalHistory: number[];
}

const INITIAL_DEVICES: DeviceData[] = [
  {
    id: '1',
    name: 'LifePO4-BMS-01',
    status: 'connected',
    voltage: 13.2,
    soc: 85,
    history: [40, 60, 55, 70, 85],
    signalStrength: 80,
    signalHistory: [70, 75, 80, 78, 80],
  },
  {
    id: '2',
    name: 'LifePO4-BMS-02',
    status: 'connected',
    voltage: 13.4,
    soc: 92,
    history: [80, 85, 88, 90, 92],
    signalStrength: 45,
    signalHistory: [50, 48, 45, 42, 45],
  },
  {
    id: '3',
    name: 'LifePO4-BMS-03',
    status: 'disconnected',
    voltage: 12.8,
    soc: 92,
    lastSeen: '1h ago',
    history: [90, 90, 90, 92, 92],
    signalStrength: 0,
    signalHistory: [0, 0, 0, 0, 0],
  },
  {
    id: '4',
    name: 'Home-Backup-A',
    status: 'connected',
    voltage: 51.2,
    soc: 45,
    history: [60, 55, 50, 48, 45],
    signalStrength: 95,
    signalHistory: [90, 92, 94, 95, 95],
  },
];

type SortOption = 'Status' | 'Name' | 'Signal' | 'SoC';
type SortDirection = 'asc' | 'desc';

export default function DevicesScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();
  
  const [activeTab, setActiveTab] = useState<'Connected' | 'All Devices'>('Connected');
  const [sortBy, setSortBy] = useState<SortOption>('Status');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [devices, setDevices] = useState<DeviceData[]>(INITIAL_DEVICES);

  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((currentDevices) =>
        currentDevices.map((device) => {
          if (device.status === 'connected') {
            const voltageChange = (Math.random() - 0.5) * 0.2;
            let newVoltage = Math.max(10, Math.min(60, device.voltage + voltageChange));
            
            let newSoc = device.soc;
            if (Math.random() > 0.8) {
               newSoc = Math.max(0, Math.min(100, device.soc + (Math.random() > 0.5 ? 1 : -1)));
            }
            const newHistory = [...device.history.slice(1), newSoc];

            // Signal
            let newSignal = device.signalStrength;
             if (Math.random() > 0.5) {
               newSignal = Math.max(0, Math.min(100, device.signalStrength + (Math.random() > 0.5 ? 5 : -5)));
            }
            const newSignalHistory = [...device.signalHistory.slice(1), newSignal];

            return {
              ...device,
              voltage: newVoltage,
              soc: newSoc,
              history: newHistory,
              signalStrength: newSignal,
              signalHistory: newSignalHistory,
            };
          }
          return device;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(option);
      // Default sort direction logic
      if (option === 'Name' || option === 'Status') {
        setSortDirection('asc');
      } else {
        setSortDirection('desc'); // Signal and SoC usually want highest first
      }
    }
  };

  const filteredDevices = activeTab === 'All Devices' 
    ? devices 
    : devices.filter(d => d.status === 'connected');

  const sortedDevices = [...filteredDevices].sort((a, b) => {
      let result = 0;
      switch (sortBy) {
          case 'Name': 
            result = a.name.localeCompare(b.name); 
            break;
          case 'Signal': 
            result = a.signalStrength - b.signalStrength; 
            break;
          case 'Status': 
            const aStatus = a.status === 'connected' ? 0 : 1;
            const bStatus = b.status === 'connected' ? 0 : 1;
            result = aStatus - bStatus;
            break;
          case 'SoC': 
            result = a.soc - b.soc; 
            break;
          default: 
            result = 0;
      }
      return sortDirection === 'asc' ? result : -result;
  });

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        
        <View style={styles.header}>
            <ThemedText type="title">My Batteries</ThemedText>
            <TouchableOpacity>
               <Ionicons name="add-circle-outline" size={32} color={theme.text} />
            </TouchableOpacity>
        </View>

        <View style={styles.segmentedControlContainer}>
             <ThemedView type="backgroundElement" style={styles.segmentedControl}>
                <TouchableOpacity 
                    style={[
                        styles.segment, 
                        activeTab === 'Connected' && { 
                            backgroundColor: theme.background, 
                            shadowColor: theme.text,
                            elevation: 2
                        }
                    ]}
                    onPress={() => setActiveTab('Connected')}
                >
                    <ThemedText type="smallBold" style={{opacity: activeTab === 'Connected' ? 1 : 0.5}}>Connected</ThemedText>
                </TouchableOpacity>
                 <TouchableOpacity 
                    style={[
                        styles.segment, 
                        activeTab === 'All Devices' && { 
                            backgroundColor: theme.background, 
                            shadowColor: theme.text,
                            elevation: 2
                        }
                    ]}
                    onPress={() => setActiveTab('All Devices')}
                >
                     <ThemedText type="smallBold" style={{opacity: activeTab === 'All Devices' ? 1 : 0.5}}>All Devices</ThemedText>
                </TouchableOpacity>
             </ThemedView>
        </View>

        <View style={styles.sortContainer}>
            <ThemedText type="small" style={{marginRight: Spacing.two}}>Sort by:</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: Spacing.two}}>
                {(['Status', 'Name', 'Signal', 'SoC'] as SortOption[]).map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.sortChip,
                            sortBy === option && { backgroundColor: theme.text }
                        ]}
                        onPress={() => handleSort(option)}
                    >
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                            <ThemedText 
                                type="small" 
                                style={{color: sortBy === option ? theme.background : theme.text}}
                            >
                                {option}
                            </ThemedText>
                            {sortBy === option && (
                                <Ionicons 
                                    name={sortDirection === 'asc' ? "arrow-up" : "arrow-down"} 
                                    size={12} 
                                    color={theme.background} 
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        <View style={styles.listContainer}>
            {sortedDevices.map(device => (
                <DeviceCard 
                    key={device.id}
                    {...device}
                    onReconnect={device.status === 'disconnected' ? () => console.log('Reconnect', device.id) : undefined}
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
    alignItems: 'center',
    marginVertical: Spacing.four,
  },
  segmentedControlContainer: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    padding: Spacing.half,
    width: '100%',
    maxWidth: 300,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sortContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.three,
  },
  sortChip: {
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.half,
      borderRadius: Spacing.three,
      borderWidth: 1,
      borderColor: 'transparent', 
  },
  activeSortChip: {
      // Handled inline for theme awareness
  },
  listContainer: {
    gap: Spacing.three,
  }
});
