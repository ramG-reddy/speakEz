import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { useBLE } from "@/lib/context/BLEContext";

export default function NavBar() {
  const { isConnected, startScan } = useBLE();

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
          <TouchableOpacity onPress={startScan} style={styles.bleButton}>
            <Text style={styles.bleButtonText}>Connect BLE</Text>
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
  bleButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
});
