import { useAppContext } from "@/lib/context/AppContext";
import { useNotification } from "@/lib/context/NotificationContext";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Settings() {
  const {
    patientInfo,
    phrases,
    checkOnboardingStatus,
    setPatientInfo,
    setPhrases,
  } = useOnboarding();
  const { showNotification } = useNotification();
  const { changeDelay, setChangeDelay } = useAppContext();
  const insets = useSafeAreaInsets();

  const [editablePatientInfo, setEditablePatientInfo] = useState({
    name: patientInfo?.name || "",
    age: patientInfo?.age || "",
    region: patientInfo?.region || "",
  });
  const [editedPhrases, setEditedPhrases] = useState([...phrases]);
  const [newPhrase, setNewPhrase] = useState("");
  const [localChangeDelay, setLocalChangeDelay] = useState(changeDelay);

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

  const handleSavePatientInfo = async () => {
    try {
      await setPatientInfo(editablePatientInfo);
      showNotification("Patient information updated successfully", "success");
    } catch (error) {
      console.error("Failed to update patient information:", error);
      showNotification("Failed to update patient information", "error");
    }
  };

  const handleUpdatePhrase = (index: number, newPhrase: string) => {
    const updatedPhrases = [...editedPhrases];
    updatedPhrases[index] = newPhrase;
    setEditedPhrases(updatedPhrases);
  };

  const handleRemovePhrase = (index: number) => {
    const updatedPhrases = editedPhrases.filter((_, i) => i !== index);
    setEditedPhrases(updatedPhrases);
  };

  const handleSavePhrases = async () => {
    try {
      await setPhrases(editedPhrases);
      showNotification("Phrases updated successfully", "success");
    } catch (error) {
      console.error("Failed to update phrases:", error);
      showNotification("Failed to update phrases", "error");
    }
  };

  const handleAddPhrase = () => {
    if (newPhrase.trim() === "") {
      showNotification("Phrase cannot be empty", "error");
      return;
    }
    setEditedPhrases([...editedPhrases, newPhrase.trim()]);
    setNewPhrase("");
  };

  const handleSaveChangeDelay = async () => {
    if (isNaN(localChangeDelay) || localChangeDelay <= 0) {
      showNotification("Invalid delay value", "error");
      return;
    }
    await setChangeDelay(localChangeDelay);
    showNotification("Change delay updated successfully", "success");
  };

  return (
    <ScrollView
      style={[
        styles.container,
        {
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 10,
          paddingLeft: insets.left + 20,
          paddingRight: insets.right + 20,
        },
      ]}
    >
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Navigation Highlight Delay (in milli sec)
        </Text>
        <View>
          <TextInput
            style={styles.input}
            value={String(localChangeDelay)}
            onChangeText={(text) => setLocalChangeDelay(Number(text))}
            placeholder="Enter delay in ms"
            keyboardType="number-pad"
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveChangeDelay}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <TextInput
              style={styles.input}
              value={editablePatientInfo.name}
              onChangeText={(text) =>
                setEditablePatientInfo({ ...editablePatientInfo, name: text })
              }
              placeholder="Enter name"
            />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age:</Text>
            <TextInput
              style={styles.input}
              value={editablePatientInfo.age}
              onChangeText={(text) =>
                setEditablePatientInfo({ ...editablePatientInfo, age: text })
              }
              placeholder="Enter age"
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Region:</Text>
            <TextInput
              style={styles.input}
              value={editablePatientInfo.region}
              onChangeText={(text) =>
                setEditablePatientInfo({ ...editablePatientInfo, region: text })
              }
              placeholder="Enter region"
            />
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSavePatientInfo}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Phrases ({editedPhrases.length})
        </Text>
        <View style={styles.phrasesContainer}>
          {editedPhrases.length > 0 ? (
            editedPhrases.map((phrase, index) => (
              <View key={index} style={styles.phraseItem}>
                <TextInput
                  style={styles.phraseText}
                  value={phrase}
                  onChangeText={(text) => handleUpdatePhrase(index, text)}
                />
                <TouchableOpacity
                  onPress={() => handleRemovePhrase(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No phrases added</Text>
          )}
        </View>
        <View style={styles.addPhraseContainer}>
          <TextInput
            style={styles.input}
            value={newPhrase}
            onChangeText={setNewPhrase}
            placeholder="Enter new phrase"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddPhrase}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSavePhrases}>
          <Text style={styles.saveButtonText}>Save Phrases</Text>
        </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
  },
  phraseText: {
    flex: 1,
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
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  saveButton: {
    backgroundColor: "#4287f5",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: "#f44336",
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  addPhraseContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  addButton: {
    backgroundColor: "#4287f5",
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  changeDelayContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
});
