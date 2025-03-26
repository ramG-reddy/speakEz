import React, { createContext, useContext, useEffect, useState } from "react";
import { Device } from "react-native-ble-plx";
import { bleService, NavigationAction } from "../services/BLEService";
import { Platform } from "react-native";

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
});

// Provider component
export function BLEProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastAction, setLastAction] = useState<NavigationAction>("none");
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);

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

  // Start scanning for devices
  const startScan = async () => {
    if (Platform.OS === "web") return;
    setIsScanning(true);
    await bleService.startScan();
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
    await bleService.connectToDevice(device);
    setIsConnected(bleService.isDeviceConnected());
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
  };

  return (
    <BLEContext.Provider value={contextValue}>{children}</BLEContext.Provider>
  );
}

// Hook for using the BLE context
export const useBLE = () => useContext(BLEContext);
