import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function LandingPage() {
  return (
    <View className="flex-1 justify-center items-center bg-white gap-4">
      <Text className="text-7xl font-bold">Welcome to the App!</Text>
      <View className="flex flex-row gap-4 items-center">
        <Link href="/settings" asChild>
          <TouchableOpacity>
            <Text className="text-blue-400 text-4xl">/Settings</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/presets" asChild>
          <TouchableOpacity>
            <Text className="text-blue-400 text-4xl">/Presets</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <Text>Connect to the Sensors to Proceed</Text>
    </View>
  );
}
