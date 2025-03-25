import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { bleService, NavigationAction } from "@/lib/services/BLEService";

type BLEContextType = {
  isConnected: boolean;
  startScan: () => void;
  stopScan: () => void;
  disconnect: () => void;
  lastAction: NavigationAction;
};

const BLEContext = createContext<BLEContextType>({
  isConnected: false,
  startScan: () => {},
  stopScan: () => {},
  disconnect: () => {},
  lastAction: "none",
});

export const BLEProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastAction, setLastAction] = useState<NavigationAction>("none");

  useEffect(() => {
    const initializeBLE = async () => {
      if (Platform.OS === "web") {
        console.warn("BLE is not supported on web platform");
        return;
      }

      const bleEnabled = await bleService.initialize();

      if (bleEnabled) {
        setIsInitialized(true);

        // Add action listener
        bleService.addListener(handleBLEAction);
      } else {
        Alert.alert(
          "Bluetooth Required",
          "Please enable Bluetooth to use the touch controls"
        );
      }
    };

    initializeBLE();

    // Cleanup on unmount
    return () => {
      if (Platform.OS !== "web") {
        bleService.removeListener(handleBLEAction);
        bleService.destroy();
      }
    };
  }, []);

  // Handle actions received from BLE
  const handleBLEAction = (action: NavigationAction) => {
    setLastAction(action);
    setIsConnected(bleService.isDeviceConnected());
  };

  // Start scanning for the device
  const startScan = () => {
    if (isInitialized && Platform.OS !== "web") {
      bleService.startScan();
    }
  };

  // Stop scanning
  const stopScan = () => {
    if (isInitialized && Platform.OS !== "web") {
      bleService.stopScan();
    }
  };

  // Disconnect from device
  const disconnect = () => {
    if (isInitialized && Platform.OS !== "web") {
      bleService.disconnect();
      setIsConnected(false);
    }
  };

  const value = {
    isConnected,
    startScan,
    stopScan,
    disconnect,
    lastAction,
  };

  return <BLEContext.Provider value={value}>{children}</BLEContext.Provider>;
};

export const useBLE = () => useContext(BLEContext);
