import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useBLE } from "@/lib/context/BLEContext";
import { Device } from "react-native-ble-plx";
import { router } from "expo-router";

type BLEDeviceSelectorProps = {
  visible: boolean;
  onClose: () => void;
};

export default function BLEDeviceSelector({
  visible,
  onClose,
}: BLEDeviceSelectorProps) {
  const { discoveredDevices, connectToDevice, isScanning } = useBLE();

  // Handler for device selection
  const handleDeviceSelect = (device: Device) => {
    connectToDevice(device);
    onClose();
  };

  // Render a device item with ESP-32 highlighting
  const renderDeviceItem = ({ item }: { item: Device }) => {
    const isESP32 =
      (item.name && item.name.includes("ESP")) ||
      (item.localName && item.localName.includes("ESP"));

    return (
      <TouchableOpacity
        style={[styles.deviceItem, isESP32 && styles.espDeviceItem]}
        onPress={() => handleDeviceSelect(item)}
      >
        {isESP32 && (
          <View style={styles.espBadge}>
            <Text style={styles.espBadgeText}>ESP</Text>
          </View>
        )}
        <Text style={[styles.deviceName, isESP32 && styles.espDeviceName]}>
          {item.name || item.localName || "Unknown Device"}
        </Text>
        <Text style={styles.deviceId}>{item.id}</Text>
        {item.rssi && (
          <Text style={styles.signalStrength}>
            Signal:{" "}
            {Math.min(Math.max(2 * (item.rssi + 100), 0), 100).toFixed(0)}%
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select a Bluetooth Device</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {(isScanning && 0) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4287f5" />
              <Text style={styles.scanningText}>Scanning for devices...</Text>
            </View>
          ) : discoveredDevices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No devices found</Text>
            </View>
          ) : (
            <FlatList
              data={discoveredDevices}
              renderItem={renderDeviceItem}
              keyExtractor={(item) => item.id}
              style={styles.deviceList}
            />
          )}

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 15,
    color: "#666",
  },
  deviceList: {
    marginVertical: 10,
  },
  deviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  deviceId: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#4287f5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  scanningText: {
    marginTop: 10,
    color: "#666",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
  },
  espDeviceItem: {
    backgroundColor: "#f0f8ff", // Light blue for ESP devices
    borderLeftWidth: 4,
    borderLeftColor: "#4287f5",
  },
  espDeviceName: {
    color: "#4287f5",
  },
  espBadge: {
    backgroundColor: "#4287f5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  espBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  signalStrength: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
