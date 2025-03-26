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

  // Render a device item
  const renderDeviceItem = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => handleDeviceSelect(item)}
    >
      <Text style={styles.deviceName}>{item.name || "Unknown Device"}</Text>
      <Text style={styles.deviceId}>{item.id}</Text>
    </TouchableOpacity>
  );

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

          {isScanning ? (
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
    maxHeight: "70%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 24,
    color: "#666",
  },
  deviceList: {
    marginVertical: 10,
  },
  deviceItem: {
    padding: 15,
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
});
