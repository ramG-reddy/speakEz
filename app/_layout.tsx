import { Stack } from "expo-router";
import { AppContextProvider } from "@/lib/context/AppContext";
import { BLEProvider } from "@/lib/context/BLEContext";
import { NotificationProvider } from "@/lib/context/NotificationContext";

import "@/app/global.css";

export default function RootLayout() {
  return (
    <AppContextProvider>
      <BLEProvider>
        <NotificationProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </NotificationProvider>
      </BLEProvider>
    </AppContextProvider>
  );
}
