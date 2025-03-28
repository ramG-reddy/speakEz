import React, { createContext, useContext, useEffect, useState } from "react";
import { Device } from "react-native-ble-plx";
import { bleService, NavigationAction } from "../services/BLEService";
import { Platform, Alert, PermissionsAndroid, Linking } from "react-native";
import { BluetoothPermissionModal } from "@/components/BluetoothPermissionModal";
import { useNotification } from "./NotificationContext";

// Define permission status types
export type PermissionStatus =
  | "unknown"
  | "checking"
  | "granted"
  | "denied"
  | "blocked";

// Define context type
type BLEContextType = {
  isConnected: boolean;
  lastAction: NavigationAction;
  startScan: () => void;
  stopScan: () => void;
  discoveredDevices: Device[];
  connectToDevice: (device: Device) => void;
  disconnect: () => void;
  isScanning: boolean;
  permissionStatus: PermissionStatus;
  requestPermissions: () => Promise<boolean>;
};

// Create context
const BLEContext = createContext<BLEContextType>({
  isConnected: false,
  lastAction: "none",
  startScan: () => {},
  stopScan: () => {},
  discoveredDevices: [],
  connectToDevice: () => {},
  disconnect: () => {},
  isScanning: false,
  permissionStatus: "unknown",
  requestPermissions: async () => false,
});

// Check current permission status
const checkBluetoothPermissions = async (): Promise<PermissionStatus> => {
  if (Platform.OS === "web") return "granted";

  if (Platform.OS === "ios") {
    // iOS permissions can't be checked programmatically in this way
    return "unknown";
  }

  if (Platform.OS === "android") {
    try {
      const apiLevel = parseInt(Platform.Version.toString(), 10);

      if (apiLevel >= 31) {
        // Android 12+
        const scanPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
        );
        const connectPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
        const locationPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        // All permissions must be granted
        if (scanPermission && connectPermission && locationPermission) {
          return "granted";
        }
        return "denied";
      } else {
        // For older Android versions
        const locationPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return locationPermission ? "granted" : "denied";
      }
    } catch (error) {
      console.error("Failed to check permissions:", error);
      return "unknown";
    }
  }

  return "unknown";
};

// Provider component
export function BLEProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastAction, setLastAction] = useState<NavigationAction>("none");
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>("unknown");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionBlocked, setPermissionBlocked] = useState(false);

  // Get notification function
  const { showNotification } = useNotification();

  // Check permissions on mount
  useEffect(() => {
    if (Platform.OS === "web") return;

    const checkPermissions = async () => {
      const status = await checkBluetoothPermissions();
      setPermissionStatus(status);
    };

    checkPermissions();
  }, []);

  // Initialize BLE
  useEffect(() => {
    // Skip for web
    if (Platform.OS === "web") return;

    bleService.initialize();

    // Set up action listener
    
    const actionListener = (action: NavigationAction) => {
      setLastAction(action);
    };
    bleService.addListener(actionListener);

    // Set up device listener
    const deviceListener = (devices: Device[]) => {
      setDiscoveredDevices(devices);
    };
    bleService.addDeviceListener(deviceListener);

    // Clean up on unmount
    return () => {
      bleService.removeListener(actionListener);
      bleService.removeDeviceListener(deviceListener);
      bleService.destroy();
    };
  }, []);

  // Update connection status on scan status change
  useEffect(() => {
    if (Platform.OS === "web") return;

    setIsConnected(bleService.isDeviceConnected());
    setIsScanning(bleService.isScanningDevices());

    // We could set up a timer to check connection status periodically
    const interval = setInterval(() => {
      setIsConnected(bleService.isDeviceConnected());
      setIsScanning(bleService.isScanningDevices());
    }, 1000);

    return () => clearInterval(interval);
  }, [discoveredDevices]);

  // Function to request permissions with better UI flow
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === "web") return true;

    // Check current status first
    const currentStatus = await checkBluetoothPermissions();
    setPermissionStatus(currentStatus);

    if (currentStatus === "granted") {
      return true;
    }

    // For Android, we'll determine if permissions are blocked
    // after a failed request
    if (Platform.OS === "android") {
      const apiLevel = parseInt(Platform.Version.toString(), 10);

      if (apiLevel >= 31) {
        // Android 12+
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const granted =
          results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED;

        if (granted) {
          setPermissionStatus("granted");
          return true;
        } else {
          // Check if any permission is never_ask_again
          const neverAskAgain =
            results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
              PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
            results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
              PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
            results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
              PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

          if (neverAskAgain) {
            setPermissionStatus("blocked");
            setPermissionBlocked(true);
          } else {
            setPermissionStatus("denied");
          }
          return false;
        }
      } else {
        // For older Android versions
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message:
              "This app needs access to your location to find Bluetooth devices",
            buttonPositive: "Grant Permission",
          }
        );

        const granted = result === PermissionsAndroid.RESULTS.GRANTED;
        if (granted) {
          setPermissionStatus("granted");
          return true;
        } else {
          const blocked = result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;
          if (blocked) {
            setPermissionStatus("blocked");
            setPermissionBlocked(true);
          } else {
            setPermissionStatus("denied");
          }
          return false;
        }
      }
    }

    // For iOS, we'll just assume we need to show the modal
    setShowPermissionModal(true);
    return false;
  };

  // Open device settings
  const openSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  // Start scanning with permission flow
  const startScan = async () => {
    if (Platform.OS === "web") return;

    // Check permissions first
    if (permissionStatus !== "granted") {
      setShowPermissionModal(true);
      return;
    }

    // Permissions are granted, start scanning
    setIsScanning(true);
    try {
      await bleService.startScan();
    } catch (error) {
      console.error("Failed to start scan:", error);
      setIsScanning(false);
      showNotification(
        "Failed to scan for Bluetooth devices. Please make sure Bluetooth is enabled.",
        "error"
      );
    }
  };

  // Handle permission request from modal
  const handleRequestPermission = async () => {
    const granted = await requestPermissions();
    if (granted) {
      setShowPermissionModal(false);
      startScan();
    }
  };

  // Stop scanning
  const stopScan = () => {
    if (Platform.OS === "web") return;
    bleService.stopScan();
    setIsScanning(false);
  };

  // Connect to a device
  const connectToDevice = async (device: Device) => {
    if (Platform.OS === "web") return;
    try {
      await bleService.connectToDevice(device);
      setIsConnected(bleService.isDeviceConnected());
      showNotification(`Connected to ${device.name || "device"}`, "success");
    } catch (error) {
      console.error("Failed to connect:", error);
      showNotification(
        "Failed to connect to the device. Please try again.",
        "error"
      );
    }
  };

  // Disconnect from device
  const disconnect = async () => {
    if (Platform.OS === "web") return;
    await bleService.disconnect();
    setIsConnected(false);
  };

  // Create context value
  const contextValue: BLEContextType = {
    isConnected,
    lastAction,
    startScan,
    stopScan,
    discoveredDevices,
    connectToDevice,
    disconnect,
    isScanning,
    permissionStatus,
    requestPermissions,
  };

  return (
    <BLEContext.Provider value={contextValue}>
      <BluetoothPermissionModal
        visible={showPermissionModal}
        onRequestPermission={handleRequestPermission}
        onOpenSettings={openSettings}
        onCancel={() => setShowPermissionModal(false)}
        permissionBlocked={permissionBlocked}
      />
      {children}
    </BLEContext.Provider>
  );
}

// Hook for using the BLE context
export const useBLE = () => useContext(BLEContext);
