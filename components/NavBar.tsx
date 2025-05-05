import {
  EMG_SENSOR_IDENTIFIER_PREFIX,
  GYRO_SENSOR_IDENTIFIER_PREFIX,
  TOUCH_SENSOR_IDENTIFIER_PREFIX,
} from "@/lib/Config";
import { useBLE } from "@/lib/context/BLEContext";
import { useNotification } from "@/lib/context/NotificationContext";
import { bleService } from "@/lib/services/BLEService";
import { Link } from "expo-router";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import BLEDeviceSelector from "./BLEDeviceSelector";

export default function NavBar() {
  const {
    isConnected,
    startScan,
    stopScan,
    isScanning,
    disconnect,
    currDeviceType,
    setCurrDeviceType,
  } = useBLE();
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [showDeviceTypeDropdown, setShowDeviceTypeDropdown] = useState(false);
  const { showNotification } = useNotification();

  const handleOpenDeviceSelector = () => {
    startScan(); // Start scanning when opening the selector
    setShowDeviceSelector(true);
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      showNotification("Device disconnected successfully.", "success");
    } catch (error) {
      console.error("Failed to disconnect:", error);
      showNotification(
        "Failed to disconnect the device. Please try again.",
        "error"
      );
    } finally {
      setCurrDeviceType("none"); // Reset device type on disconnect
      setShowDeviceTypeDropdown(false); // Close the dropdown if open
      stopScan(); // Stop scanning after disconnecting
    }
  };

  const handleDeviceTypeSelect = (type: string) => {
    setCurrDeviceType(type);
    setShowDeviceTypeDropdown(false);
    showNotification(`Device type set to ${type}`, "success");
  };

  const closeDropdown = () => {
    setShowDeviceTypeDropdown(false);
  };

  return (
    <>
      {/* Transparent overlay to capture touches outside dropdown */}
      {showDeviceTypeDropdown && (
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <View className="h-28 bg-gray-800 flex flex-row justify-between items-center px-4">
        <Link href="/" asChild>
          <TouchableOpacity>
            <Text className="text-white text-5xl">SpeakEz</Text>
          </TouchableOpacity>
        </Link>

        <View className="flex flex-row gap-6 items-center">
          {/* BLE Connection Button - Only show when not connected and not on web */}

          {isConnected && Platform.OS !== "web" && (
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.deviceTypeButton}
                onPress={() =>
                  setShowDeviceTypeDropdown(!showDeviceTypeDropdown)
                }
              >
                <Text style={styles.deviceTypeButtonText}>
                  {currDeviceType === "none" ? "Select Type" : currDeviceType}
                </Text>
              </TouchableOpacity>

              {showDeviceTypeDropdown && (
                <View style={styles.dropdown}>
                  {[
                    TOUCH_SENSOR_IDENTIFIER_PREFIX,
                    GYRO_SENSOR_IDENTIFIER_PREFIX,
                    EMG_SENSOR_IDENTIFIER_PREFIX,
                  ].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.dropdownItem,
                        currDeviceType === type && styles.activeDropdownItem,
                      ]}
                      onPress={() => handleDeviceTypeSelect(type)}
                    >
                      <Text style={styles.dropdownItemText}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {!isConnected && Platform.OS !== "web" && (
            <TouchableOpacity
              onPress={handleOpenDeviceSelector}
              style={[styles.bleButton, isScanning && styles.bleButtonScanning]}
              disabled={isScanning}
            >
              <Text style={styles.bleButtonText}>
                {isScanning ? "Scanning..." : "Connect BLE"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Disconnect Button - Only show when connected */}
          {isConnected && (
            <TouchableOpacity
              onPress={handleDisconnect}
              style={styles.disconnectButton}
            >
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
          )}

          {/* <Link href="/api-test" asChild>
            <TouchableOpacity>
              <Text className="text-blue-400">🌐</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/presets" asChild>
            <TouchableOpacity>
              <Text className="text-blue-400">📃</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/settings" asChild>
            <TouchableOpacity>
              <Text className="text-blue-400">⚙️</Text>
            </TouchableOpacity>
          </Link> */}
        </View>

        {/* Device selector modal */}
        <BLEDeviceSelector
          visible={showDeviceSelector}
          onClose={() => {
            setShowDeviceSelector(false);
            bleService.stopScan(); // Stop scanning when closing the selector
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bleButton: {
    backgroundColor: "#4287f5",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  bleButtonScanning: {
    backgroundColor: "#808080",
  },
  bleButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  disconnectButton: {
    backgroundColor: "#f44336",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  disconnectButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  dropdownContainer: {
    position: "relative",
    zIndex: 100, // Higher than overlay
  },
  deviceTypeButton: {
    backgroundColor: "#4287f5",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  deviceTypeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  dropdown: {
    position: "absolute",
    top: 30,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    width: 100,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activeDropdownItem: {
    backgroundColor: "#f0f8ff",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#333",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 50,
  },
});
