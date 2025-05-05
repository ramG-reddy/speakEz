import React from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type BluetoothPermissionModalProps = {
  visible: boolean;
  onRequestPermission: () => void;
  onOpenSettings: () => void;
  onCancel: () => void;
  permissionBlocked: boolean;
};

export function BluetoothPermissionModal({
  visible,
  onRequestPermission,
  onOpenSettings,
  onCancel,
  permissionBlocked,
}: BluetoothPermissionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Image
              source={require("@/assets/images/bluetooth-icon.png")}
              style={styles.icon}
              defaultSource={require("@/assets/images/bluetooth-icon.png")}
            />
          </View>

          <Text style={styles.title}>Bluetooth Permission Required</Text>

          <Text style={styles.message}>
            SpeakEz needs Bluetooth permission to connect to your ESP-32
            controller.
            {permissionBlocked
              ? "\n\nYou've previously denied this permission. Please enable it in your device settings."
              : "\n\nThis allows the app to interact with the ESP-32 for navigation controls."}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            {permissionBlocked ? (
              <TouchableOpacity
                style={[styles.button, styles.settingsButton]}
                onPress={onOpenSettings}
              >
                <Text style={styles.buttonText}>Open Settings</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.grantButton]}
                onPress={onRequestPermission}
              >
                <Text style={styles.buttonText}>Grant Permission</Text>
              </TouchableOpacity>
            )}
          </View>
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
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e6f2ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    width: 50,
    height: 50,
    tintColor: "#0066cc",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    alignItems: "center",
  },
  grantButton: {
    backgroundColor: "#0066cc",
  },
  settingsButton: {
    backgroundColor: "#0066cc",
  },
  cancelButton: {
    backgroundColor: "#f2f2f2",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
});
