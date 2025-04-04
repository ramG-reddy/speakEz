import { useAppContext } from "@/lib/context/AppContext";
import { useBLE } from "@/lib/context/BLEContext";
import { PRESETS } from "@/lib/constants/Data";
import { handleInput } from "@/lib/utils/handleInput";
import { useGridScroll } from "@/lib/hooks/useGridScroll";
import { useBLEInput } from "@/lib/hooks/useBLEInput";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { speakText } from "@/lib/utils/speakText";

export default function Presets() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const { currHighlithedNav } = useAppContext();
  const numCols = 3;
  const [presetArray, setPresetArray] = useState(PRESETS);
  const { width } = Dimensions.get("window");
  const isSmallDevice = width < 1024;
  const { isConnected } = useBLE();

  // Use the grid scroll hook
  const { handleItemLayout, safeScrollToPosition, getListProps } =
    useGridScroll({
      numCols,
      isSmallDevice,
    });

  // Add word builder to presets array
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

  // Define the action handler to avoid code duplication
  const handlePresetAction = () => {
    if (presetArray[selectedPreset]?.id === "wordBuilder") {
      router.push("./word-builder");
      return;
    }
    const phrase = `${presetArray[selectedPreset]?.text || ""}`;
    console.log(phrase);
    speakText(phrase);
  };

  // Use the BLE input hook to respond to hardware controls
  const { currentIndex } = useBLEInput({
    array: presetArray,
    index: selectedPreset,
    numCols,
    onAction: handlePresetAction,
    isEnabled: isConnected, // Only enable when connected
  });

  // Update selected preset when BLE input changes
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < presetArray.length) {
      setSelectedPreset(currentIndex);
    }
  }, [currentIndex, presetArray.length]);

  // Auto-scroll to the selected preset
  useEffect(() => {
    safeScrollToPosition(selectedPreset, presetArray.length);
  }, [selectedPreset, presetArray.length]);

  // Handle tap event (manual input)
  const handleTap = () => {
    let nextPreset = handleInput({
      currHighlithedNav,
      array: presetArray,
      index: selectedPreset,
      numCols,
      onAction: handlePresetAction,
    });

    // Ensure we have a valid index
    if (nextPreset >= 0 && nextPreset < presetArray.length) {
      setSelectedPreset(nextPreset);
    }
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
        item.id === "wordBuilder" && { backgroundColor: "#ADFF5B" },
      ]}
      onLayout={index === 0 ? handleItemLayout : undefined}
    >
      <Text
        style={[styles.presetText, isSmallDevice && styles.smallPresetText]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={() => handleTap()}
      className="flex-1 p-2 md:p-4 bg-[#72919E]"
    >
      <Text
        className={`${
          isSmallDevice ? "text-2xl" : "text-4xl"
        } font-semibold px-2 mb-2 md:mb-4`}
      >
        Presets
      </Text>
      <FlatList
        {...getListProps()}
        data={presetArray}
        renderItem={PresetItem}
        numColumns={numCols}
        keyExtractor={(item) => item.id}
        initialNumToRender={presetArray.length}
        maxToRenderPerBatch={presetArray.length}
        windowSize={21}
        extraData={selectedPreset} // Ensure re-render when selection changes
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  presetCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    margin: 4,
  },
  selectedPreset: {
    backgroundColor: "#ADFF5B",
  },
  presetText: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
  },
  smallPresetText: {
    fontSize: 14,
  },
  presetGrid: {
    gap: 12,
  },
});
