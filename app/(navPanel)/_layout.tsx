import NavPatch from "@/components/NavPatch";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <View className="flex-1 flex-row">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { flex: 1 },
        }}
      />
      <View className="flex-center w-[25%] bg-slate-200">
        <NavPatch />
      </View>
    </View>
  );
}
