import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { Device } from 'react-native-ble-plx';
import { useBLE } from '../hooks/use-ble';

export default function DevicesScreen() {
  const {
    allDevices,
    connectedDevice,
    connectToDevice,
    disconnectFromDevice,
    requestPermissions,
    scanForDevices,
    stopScanning,
  } = useBLE();
  const [isScanning, setIsScanning] = useState(false);

  const scanForDevicesHandler = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      setIsScanning(true);
      scanForDevices();
      // Auto-stop scanning after 10 seconds
      setTimeout(() => {
        stopScanning();
        setIsScanning(false);
      }, 10000);
    }
  };

  const renderDeviceModalListItem = (item: Device) => {
    return (
      <TouchableOpacity
        onPress={() => connectToDevice(item)}
        style={styles.deviceItem}
      >
        <Text style={styles.deviceName}>{item.name || item.localName || 'Unnamed Device'}</Text>
        <Text style={styles.deviceId}>{item.id}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bluetooth Devices</Text>
      </View>
      {connectedDevice ? (
        <View style={styles.connectedContainer}>
          <Text style={styles.connectedTitle}>Connected to:</Text>
          <Text style={styles.deviceName}>{connectedDevice.name}</Text>
          <TouchableOpacity
            onPress={disconnectFromDevice}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={allDevices}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => renderDeviceModalListItem(item)}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity
            onPress={isScanning ? stopScanning : scanForDevicesHandler}
            style={[styles.button, isScanning && styles.buttonScanning]}
          >
            <Text style={styles.buttonText}>
              {isScanning ? 'Stop Scanning' : 'Scan for Devices'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 20,
  },
  deviceItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  deviceId: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  button: {
    margin: 20,
    padding: 15,
    backgroundColor: '#208AEF',
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonScanning: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  connectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  connectedTitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 10,
  },
});
