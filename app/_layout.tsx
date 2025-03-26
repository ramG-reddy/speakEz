import NavBar from "@/components/NavBar";
import { Stack } from "expo-router";
import { View } from "react-native";
import { AppContextProvider } from "@/lib/context/AppContext";
import { BLEProvider } from "@/lib/context/BLEContext";

import "./global.css";

export default function RootLayout() {
  return (
    <AppContextProvider>
      <BLEProvider>
        <View className="flex-1">
          <NavBar />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { flex: 1 },
            }}
          />
        </View>
      </BLEProvider>
    </AppContextProvider>
  );
}
