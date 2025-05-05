import { PatientInfo, useOnboarding } from "@/lib/context/OnboardingContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PatientInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setPatientInfo } = useOnboarding();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [region, setRegion] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    age: "",
    region: "",
  });

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { name: "", age: "", region: "" };

    if (!name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!age.trim()) {
      newErrors.age = "Age is required";
      isValid = false;
    } else if (isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120) {
      newErrors.age = "Please enter a valid age";
      isValid = false;
    }

    if (!region.trim()) {
      newErrors.region = "Region is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const patientInfo: PatientInfo = {
        name: name.trim(),
        age: age.trim(),
        region: region.trim(),
      };

      await setPatientInfo(patientInfo);
      router.push("/phrases");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ScrollView
        style={[
          styles.container,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
            paddingLeft: insets.left + 20,
            paddingRight: insets.right + 20,
          },
        ]}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>Step 1 of 2</Text>
          <Text style={styles.title}>Patient Information</Text>
          <Text style={styles.subtitle}>
            Please enter the patient's details below
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Patient's Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
              placeholderTextColor="#999"
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Patient's Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter age"
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />
            {errors.age ? (
              <Text style={styles.errorText}>{errors.age}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Region</Text>
            <TextInput
              style={styles.input}
              value={region}
              onChangeText={setRegion}
              placeholder="Enter region or location"
              placeholderTextColor="#999"
            />
            {errors.region ? (
              <Text style={styles.errorText}>{errors.region}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    marginBottom: 30,
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
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  errorText: {
    color: "#f44336",
    fontSize: 14,
    marginTop: 4,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingVertical: 20,
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
