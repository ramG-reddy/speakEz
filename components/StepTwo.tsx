import React from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
  Text,
  useWindowDimensions,
} from "react-native";
import { StepTwoProps } from "../app/(home)/types";

const StepTwo: React.FC<StepTwoProps> = ({
  formData,
  setFormData,
  onNext,
  onBack,
}) => {
  const updateField = (key: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [key]: value });
  };
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 770;
  const styles = StyleSheet.create({
    button: {
      width: !isSmallScreen ? 168 : 64,
      height: !isSmallScreen ? 67 : 32,
      borderRadius: 64,
      paddingTop: 11,
      paddingBottom: 11,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#60A5FA", // Tailwind's blue-400
    },
    text: {
      color: "black",
      fontSize: !isSmallScreen ? 32 : 16,
      fontWeight: "bold",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 64,
    },
    field: {
      width: !isSmallScreen ? 330 : 280,
      flexDirection: "row",
      alignContent: "center",
      justifyContent: "center",
      gap: 20,
    },
    label: {
      fontSize: !isSmallScreen ? 32 : 16,
      fontWeight: "500",
      marginBottom: 4,
      alignContent: "center",
      color: "#000",
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: "#fff",
    },
    columnLayout: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16, // Optional vertical spacing for column layout
  },
  });
  return (
    <View className="flex-col w-full h-full justify-between py-[40px]">
      <View>
        <View style={[styles.row, isSmallScreen && styles.columnLayout]}>
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              placeholder="Enter your name"
              value={formData.name}
              onChangeText={(v) => updateField("name", v)}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Timezone</Text>
            <TextInput
              placeholder="Enter your timezone"
              value={formData.timezone}
              onChangeText={(v) => updateField("timezone", v)}
              style={styles.input}
            />
          </View>
        </View>

        <View style={[styles.row, isSmallScreen && styles.columnLayout]}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(v) => updateField("email", v)}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Language</Text>
            <TextInput
              placeholder="Enter your language"
              value={formData.language}
              onChangeText={(v) => updateField("language", v)}
              style={styles.input}
            />
          </View>
        </View>
      </View>

      <View className="flex flex-row justify-between gap-5 w-full px-[100px]">
        <Pressable onPress={onBack} style={styles.button}>
          <Text style={styles.text}>Back</Text>
        </Pressable>
        <Pressable onPress={onNext} style={styles.button}>
          <Text style={styles.text}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default StepTwo;
