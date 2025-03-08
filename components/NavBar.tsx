import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function NavBar() {
  return (
    <View className="h-16 bg-gray-800 flex flex-row justify-between items-center px-4">
      <Link href="/" asChild>
        <TouchableOpacity>
          <Text className="text-white text-3xl">SpeakEz</Text>
        </TouchableOpacity>
      </Link>
      <View className="flex flex-row gap-6">
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
