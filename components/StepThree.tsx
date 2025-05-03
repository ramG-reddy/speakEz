import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { StepThreeProps } from "../app/(home)/types";

const StepThree: React.FC<StepThreeProps> = ({
  formData,
  setFormData,
  onBack,
}) => {
  const [sentence, setSentence] = useState("");
  const [sentences, setSentences] = useState<string[]>([]);
  const { width } = useWindowDimensions();
  useEffect(() => {
    const saved = localStorage.getItem("sentences");
    if (saved) setSentences(JSON.parse(saved));
  }, []);

  const saveToLocal = (data: string[]) => {
    localStorage.setItem("sentences", JSON.stringify(data));
  };

  const addSentence = () => {
    if (!sentence.trim()) return;
    const updated = [...sentences, sentence];
    setSentences(updated);
    setSentence("");
    saveToLocal(updated);
  };

  const deleteSentence = (index: number) => {
    const updated = sentences.filter((_, i) => i !== index);
    setSentences(updated);
    saveToLocal(updated);
  };

  const handleSubmit = () => {
    const updatedData = { ...formData, sentences };
    setFormData(updatedData);
    console.log("Submitted:", updatedData);
  };
  const isSmallScreen = width < 770;
  const styles = StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
      paddingHorizontal:20,
    },
    field: {
      paddingHorizontal:20,
      width: "100%",
      height: 78,
      justifyContent: "space-between",
    },
    label: {
      fontSize: 32,
      fontWeight: "500",
      marginBottom: 4,
      color: "#000",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    input: {
      flex: 1,
      height: 48,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: "#fff",
      marginRight: 10,
    },
    addButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#60A5FA",
      justifyContent: "center",
      alignItems: "center",
    },
    addButtonText: {
      fontSize: 20,
      color: "#000",
    },
    listItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginVertical: 5,
      borderRadius: 8,
      backgroundColor: "#f4f4f5",
    },
    listText: {
      flex: 1,
      marginRight: 10,
      color: "#000",
    },
    delete: {
      color: "red",
      fontSize: 18,
    },
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
    submitButton: {
      marginTop: 24,
      width: '100%',
      height: 67,
      backgroundColor: '#60A5FA',
      justifyContent: 'center',
      alignItems: 'center',
    },
    submitButtonText: {
      color: 'black',
      fontSize: 40,
      fontWeight: 'bold',
    },
  });

  return (
    <View className="flex-col w-full h-full justify-between py-[40px]">
      <View>
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Add Sentence</Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Enter sentence"
                value={sentence}
                onChangeText={setSentence}
                style={styles.input}
              />
              <TouchableOpacity onPress={addSentence} style={styles.addButton}>
                <Text style={styles.addButtonText}>➕</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <FlatList
          data={sentences}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.listItem}>
              <Text style={styles.listText}>{item}</Text>
              <TouchableOpacity onPress={() => deleteSentence(index)}>
                <Text style={styles.delete}>❌</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <View className="flex flex-row justify-center gap-5 w-full">
        <Pressable onPress={onBack} style={styles.button}>
          <Text style={styles.text}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default StepThree;
