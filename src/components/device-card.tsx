import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type DeviceStatus = 'connected' | 'disconnected';

export interface DeviceCardProps {
  name: string;
  status: DeviceStatus;
  voltage: number;
  soc: number;
  lastSeen?: string;
  history: number[]; // Array of values 0-100 for the bar graph
  signalHistory?: number[]; // Array of values 0-100 representing signal quality
  onReconnect?: () => void;
}

export function DeviceCard({
  name,
  status,
  voltage,
  soc,
  lastSeen,
  history,
  signalHistory,
  onReconnect,
}: DeviceCardProps) {
  const isConnected = status === 'connected';
  const statusColor = isConnected ? '#34C759' : '#FF3B30'; // iOS Green / Red

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <View>
            <ThemedText type="defaultSemiBold">{name}</ThemedText>
            <ThemedText type="small" style={{ color: statusColor }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </ThemedText>
            {isConnected && signalHistory && (
               <View style={styles.signalRow}>
                  <Ionicons name="bluetooth" size={12} color="#007AFF" />
                   <View style={styles.signalSparklineContainer}>
                      {signalHistory.map((val, index) => (
                        <View
                          key={index}
                          style={[
                            styles.sparklineBar,
                            {
                              height: `${Math.max(10, val)}%`,
                              backgroundColor: '#007AFF',
                              width: 3,
                            },
                          ]}
                        />
                      ))}
                   </View>
               </View>
            )}
            {!isConnected && lastSeen && (
              <ThemedText type="small" themeColor="textSecondary">
                Last Seen: {lastSeen}
              </ThemedText>
            )}
          </View>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.socRow}>
            <ThemedText type="defaultSemiBold">{soc}%</ThemedText>
            {/* Sparkline / Bar Graph */}
            <View style={styles.sparklineContainer}>
              {history.map((val, index) => (
                <View
                  key={index}
                  style={[
                    styles.sparklineBar,
                    {
                      height: `${Math.max(10, val)}%`,
                      backgroundColor: isConnected ? '#8E8E93' : '#C7C7CC', // Grey bars
                    },
                  ]}
                />
              ))}
            </View>
            <Ionicons name="information-circle-outline" size={24} color="#8E8E93" />
          </View>
          <View style={styles.voltageRow}>
             <ThemedText type="small" themeColor="textSecondary">
              Voltage: {isConnected ? `${voltage.toFixed(1)}V` : '--V'}
            </ThemedText>
            <Ionicons name="power-outline" size={20} color="#007AFF" style={{marginLeft: 8}}/>
          </View>
        </View>
      </View>

      {!isConnected && onReconnect && (
        <View style={styles.actionRow}>
           <ThemedText type="linkPrimary" onPress={onReconnect} style={{textAlign: 'right', width: '100%'}}>
              Reconnect
           </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    marginBottom: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
    flex: 1,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  signalSparklineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 16,
    gap: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  metricsContainer: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  socRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sparklineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 24,
    gap: 2,
    marginHorizontal: 4,
  },
  sparklineBar: {
    width: 4,
    borderRadius: 2,
  },
  voltageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  actionRow: {
    marginTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C7C7CC',
    paddingTop: Spacing.two,
  }
});
