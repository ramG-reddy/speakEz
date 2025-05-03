import { Stack } from "expo-router";
import { AppContextProvider } from "@/lib/context/AppContext";
import { BLEProvider } from "@/lib/context/BLEContext";
import { NotificationProvider } from "@/lib/context/NotificationContext";
import { OnboardingProvider } from "@/lib/context/OnboardingContext";

import "@/app/global.css";

export default function RootLayout() {
  return (
    <AppContextProvider>
      <BLEProvider>
        <NotificationProvider>
          <OnboardingProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </OnboardingProvider>
        </NotificationProvider>
      </BLEProvider>
    </AppContextProvider>
  );
}
