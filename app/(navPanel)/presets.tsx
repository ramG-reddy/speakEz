import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  FlatList,
} from "react-native";
import { PRESETS } from "@/lib/constants/Data";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { handleInput } from "@/lib/utils/handleInput";

export default function Presets() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const { currHighlithedNav } = useAppContext();
  const numCols = 3;

  // Handle tap event
  const handleTap = () => {
    let nextPreset = handleInput({
      currHighlithedNav,
      array: PRESETS,
      index: selectedPreset,
      numCols: 3,
      onAction: () => {
        const phrase = `${PRESETS[selectedPreset].text}`;
        console.log(phrase);
        if (Platform.OS === "web") {
          const utterance = new SpeechSynthesisUtterance(phrase);
          window.speechSynthesis.speak(utterance);
        } else {
          // Tts.speak(phrase);
        }
      }
    });
    setSelectedPreset(nextPreset);
  };

  const PresetItem = ({
    item,
    index,
  }: {
    item: (typeof PRESETS)[0];
    index: number;
  }) => (
    <View
      style={[
        styles.presetCard,
        selectedPreset === index && styles.selectedPreset,
      ]}
    >
      <Text style={styles.presetText}>{item.text}</Text>
    </View>
  );

  return (
    <Pressable onPress={() => handleTap()} className="flex-1 p-4">
      <Text className="text-4xl font-semibold px-2 mb-4">Presets</Text>
      <FlatList
        data={PRESETS}
        renderItem={PresetItem}
        numColumns={numCols}
        keyExtractor={(item) => item.id}
        // contentContainerStyle={styles.presetGrid}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  presetCard: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 8,
    padding: 16,
    margin: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  selectedPreset: {
    borderColor: "#00f",
    borderWidth: 2,
  },
  presetText: {
    color: "#000",
    fontSize: 16,
  },
  presetGrid: {
    gap: 12,
  },
});
