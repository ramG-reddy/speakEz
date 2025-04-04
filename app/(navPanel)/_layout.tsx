import NavPatch from "@/components/NavPatch";
import { Stack } from "expo-router";
import { Dimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NavPanelLayout() {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");

  // Calculate responsive width - smaller percentage for smaller screens
  const navPatchWidth = width < 768 ? "20%" : "25%";

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
      <View
        style={{
          width: navPatchWidth,
          backgroundColor: "#D5F2FF", // bg-slate-200 equivalent
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: insets.bottom,
          paddingRight: insets.right,
        }}
      >
        <NavPatch />
      </View>
    </View>
  );
}
