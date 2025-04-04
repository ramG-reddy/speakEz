import NavBar from "@/components/NavBar";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function HomeLayout() {
  return (
    <View className="flex-1">
      <NavBar />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { flex: 1 },
        }}
      />
    </View>
  );
}
