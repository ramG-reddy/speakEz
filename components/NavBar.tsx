import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { useBLE } from "@/lib/context/BLEContext";
import { useState } from "react";
import BLEDeviceSelector from "./BLEDeviceSelector";

export default function NavBar() {
  const { isConnected, startScan, isScanning } = useBLE();
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  const handleOpenDeviceSelector = () => {
    startScan(); // Start scanning when opening the selector
    setShowDeviceSelector(true);
  };

  return (
    <View className="h-16 bg-gray-800 flex flex-row justify-between items-center px-4">
      <Link href="/" asChild>
        <TouchableOpacity>
          <Text className="text-white text-3xl">SpeakEz</Text>
        </TouchableOpacity>
      </Link>

      <View className="flex flex-row gap-6 items-center">
        {/* BLE Connection Button - Only show when not connected and not on web */}
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

        <Link href="/presets" asChild>
          <TouchableOpacity>
            <Text className="text-blue-400">📃</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/settings" asChild>
          <TouchableOpacity>
            <Text className="text-blue-400">⚙️</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Device selector modal */}
      <BLEDeviceSelector
        visible={showDeviceSelector}
        onClose={() => setShowDeviceSelector(false)}
      />
    </View>
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
});
