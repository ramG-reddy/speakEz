import { Stack } from "expo-router";
import { useEffect } from "react";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { router } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";

export default function OnboardingLayout() {
  const { loading, checkOnboardingStatus } =
    useOnboarding();

  useEffect(() => {
    const checkStatus = async () => {
      const completed = await checkOnboardingStatus();
      if (completed) {
        // If onboarding is complete, redirect to the main app
        router.replace("/(home)/landing-page");
      }
    };

    checkStatus();
  }, []);

  // Show loading indicator while checking onboarding status
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4287f5" />
        <Text className="mt-4 text-gray-500">Loading...</Text>
      </View>
    );
  }

  // If onboarding is complete, the useEffect will redirect
  // If still here, continue with onboarding
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "slide_from_right",
      }}
    />
  );
}
