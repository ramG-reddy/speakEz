import NavPatch from "@/components/NavPatch";
import { router, Stack } from "expo-router";
import { Dimensions, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useBLE } from "@/lib/context/BLEContext";

export default function NavPanelLayout() {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");
  const { isConnected } = useBLE(); // Assuming you have a BLE context to check connection status

  const [currentTime, setCurrentTime] = useState("");

  const RightSideBar = () => {
    return (
      <View
        style={{
          width: navPatchWidth,
          backgroundColor: "#D5F2FF", // bg-slate-200 equivalent
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: insets.bottom,
          paddingRight: insets.right,
        }}
        className="flex gap-4"
      >
        <View>
          <Text className="max-lg:text-4xl lg:text-7xl font-semibold">
            {currentTime}
          </Text>
        </View>
        <NavPatch />
        <Pressable onPress={() => router.push("../(home)/landing-page")}>
          <View className="justify-center items-center bg-blue-500 rounded-lg shadow-md">
            <Text className="text-white text-lg px-4 py-2">Home</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Calculate responsive width - smaller percentage for smaller screens
  const navPatchWidth = width < 768 ? "20%" : "25%";

  const showSideBar = () => {
    return true;
  }

  return (
    <View className="flex-1 flex-row">
      <View style={{ flex: 1, overflow: "hidden" }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { flex: 1 },
          }}
        />
      </View>
      {showSideBar() && <RightSideBar />}
    </View>
  );
}
