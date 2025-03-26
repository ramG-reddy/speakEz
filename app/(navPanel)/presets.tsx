import { useAppContext } from "@/lib/context/AppContext";
import { PRESETS } from "@/lib/constants/Data";
import { handleInput } from "@/lib/utils/handleInput";
import { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { speakText } from "@/lib/utils/speakText";

export default function Presets() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const { currHighlithedNav } = useAppContext();
  const numCols = 3;
  const [presetArray, setPresetArray] = useState(PRESETS);

  useEffect(() => {
    setPresetArray((prev) => {
      const newPresets = [
        ...prev,
        {
          id: "wordBuilder",
          text: "WORD BUILDER →",
        },
      ];
      return newPresets;
    });
  }, []);

  // Handle tap event
  const handleTap = () => {
    let nextPreset = handleInput({
      currHighlithedNav,
      array: presetArray,
      index: selectedPreset,
      numCols: 3,
      onAction: () => {
        if (presetArray[selectedPreset].id === "wordBuilder") {
          router.push("./word-builder");
          return;
        }
        const phrase = `${presetArray[selectedPreset].text}`;
        console.log(phrase);
        speakText(phrase);
      },
    });
    setSelectedPreset(nextPreset);
  };

  const PresetItem = ({
    item,
    index,
  }: {
    item: (typeof presetArray)[0];
    index: number;
  }) => (
    <View
      style={[
        styles.presetCard,
        selectedPreset === index && styles.selectedPreset,
        item.id === "wordBuilder" && { backgroundColor: "#bedead" },
      ]}
    >
      <Text style={styles.presetText}>{item.text}</Text>
    </View>
  );

  return (
    <Pressable onPress={() => handleTap()} className="flex-1 p-4">
      <Text className="text-4xl font-semibold px-2 mb-4">Presets</Text>
      <FlatList
        data={presetArray}
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
