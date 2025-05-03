import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PRESETS } from "@/lib/constants/Data";

export default function PhrasesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { patientInfo, setPhrases, completeOnboarding } = useOnboarding();

  const [currentPhrases, setCurrentPhrases] =
    useState<{ id: string; text: string }[]>(PRESETS);
  const [newPhrase, setNewPhrase] = useState("");
  const [error, setError] = useState("");

  const validatePhrase = (): boolean => {
    if (!newPhrase.trim()) {
      setError("Please enter a phrase");
      return false;
    }

    if (
      currentPhrases.some(
        (phrase) => phrase.text.toLowerCase() === newPhrase.trim().toLowerCase()
      )
    ) {
      setError("This phrase already exists");
      return false;
    }

    setError("");
    return true;
  };

  const addPhrase = () => {
    if (validatePhrase()) {
      const newId = (
        Math.max(...currentPhrases.map((p) => parseInt(p.id)), 0) + 1
      ).toString();
      const updatedPhrases = [
        ...currentPhrases,
        { id: newId, text: newPhrase.trim() },
      ];
      setCurrentPhrases(updatedPhrases);
      setNewPhrase("");
    }
  };

  const removePhrase = (id: string) => {
    if (Platform.OS === "web") {
      const confirmRemove = confirm(
        "Are you sure you want to remove this phrase?"
      );
      if (!confirmRemove) return;
      const updatedPhrases = currentPhrases.filter(
        (phrase) => phrase.id !== id
      );
      setCurrentPhrases(updatedPhrases);
      return;
    }
    Alert.alert(
      "Remove Phrase",
      "Are you sure you want to remove this phrase?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => {
            const updatedPhrases = currentPhrases.filter(
              (phrase) => phrase.id !== id
            );
            setCurrentPhrases(updatedPhrases);
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleComplete = async () => {
    if (currentPhrases.length === 0) {
      setError("Please add at least one phrase");
      return;
    }

    await setPhrases(currentPhrases);
    await completeOnboarding();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
            paddingLeft: insets.left + 20,
            paddingRight: insets.right + 20,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>Step 2 of 2</Text>
          <Text style={styles.title}>Frequent Phrases</Text>
          <Text style={styles.subtitle}>
            Add phrases that {patientInfo?.name} frequently uses
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newPhrase}
            onChangeText={(text) => {
              setNewPhrase(text);
              if (error) setError("");
            }}
            placeholder="Enter a phrase"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.addButton} onPress={addPhrase}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.sectionTitle}>Current Phrases</Text>

        {currentPhrases.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No phrases added yet. Add some phrases above.
            </Text>
          </View>
        ) : (
          <FlatList
            data={currentPhrases}
            renderItem={({ item }) => (
              <View style={styles.phraseItem}>
                <Text style={styles.phraseText}>{item.text}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePhrase(item.id)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id}
            style={styles.phrasesList}
          />
        )}

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleComplete}
          >
            <Text style={styles.primaryButtonText}>Complete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  stepIndicator: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  addButton: {
    backgroundColor: "#4287f5",
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  errorText: {
    color: "#f44336",
    fontSize: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 16,
  },
  phrasesList: {
    flex: 1,
  },
  phraseItem: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  phraseText: {
    fontSize: 16,
    flex: 1,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyStateText: {
    color: "#666",
    textAlign: "center",
    fontSize: 16,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingVertical: 8,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4287f5",
  },
  secondaryButtonText: {
    color: "#4287f5",
    fontSize: 16,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: "#4287f5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
