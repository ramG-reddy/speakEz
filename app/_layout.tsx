import NavBar from "@/components/NavBar";
import { Stack } from "expo-router";
import { View } from "react-native";
import { AppContextProvider } from "@/context/AppContext";

import "./global.css";

export default function RootLayout() {
  return (
    <AppContextProvider>
      <View className="flex-1">
        <NavBar />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { flex: 1 },
          }}
        />
      </View>
    </AppContextProvider>
  );
}
