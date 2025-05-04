import { useNotification } from "@/lib/context/NotificationContext";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Settings() {
  const { patientInfo, phrases, checkOnboardingStatus } = useOnboarding();
  const { showNotification } = useNotification();
  const insets = useSafeAreaInsets();

  const resetOnboarding = async () => {
    if (Platform.OS === "web") {
      const confirmRemove = confirm(
        "Are you sure you want to Reset Onboarding?"
      );
      if (!confirmRemove) return;
      const remove = async () => {
        try {
          await AsyncStorage.clear();
          showNotification("Onboarding reset successfully", "success");

          // Trigger a check of onboarding status, which will redirect to onboarding
          await checkOnboardingStatus();
          router.replace("../(onboarding)");
        } catch (error) {
          console.error("Failed to reset onboarding:", error);
          showNotification("Failed to reset onboarding", "error");
        }
      };
      remove();
      return;
    }
    Alert.alert(
      "Reset Onboarding",
      "This will clear all patient data and restart the onboarding process. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              showNotification("Onboarding reset successfully", "success");

              // Trigger a check of onboarding status, which will redirect to onboarding
              await checkOnboardingStatus();
              router.replace("../(onboarding)");
            } catch (error) {
              console.error("Failed to reset onboarding:", error);
              showNotification("Failed to reset onboarding", "error");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left + 10,
          paddingRight: insets.right + 10,
        },
      ]}
    >
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>
              {patientInfo?.name || "Not set"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age:</Text>
            <Text style={styles.infoValue}>
              {patientInfo?.age || "Not set"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Region:</Text>
            <Text style={styles.infoValue}>
              {patientInfo?.region || "Not set"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phrases ({phrases.length})</Text>
        <View style={styles.phrasesContainer}>
          {phrases.length > 0 ? (
            phrases.map((phrase) => (
              <View style={styles.phraseItem}>
                <Text style={styles.phraseText}>{phrase}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No phrases added</Text>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetOnboarding}>
          <Text style={styles.resetButtonText}>Reset Onboarding</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: "500",
    width: 70,
  },
  infoValue: {
    flex: 1,
  },
  phrasesContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
  },
  phraseItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  phraseText: {
    fontSize: 16,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    padding: 16,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  resetButton: {
    backgroundColor: "#f44336",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  resetButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
