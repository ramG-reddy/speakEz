import { useAppContext } from "@/lib/context/AppContext";
import { useBLE } from "@/lib/context/BLEContext";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useGridScroll } from "@/lib/hooks/useGridScroll";
import { NavAction } from "@/lib/types";
import { handleInput } from "@/lib/utils/handleInput";
import { speakText } from "@/lib/utils/speakText";
import { router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Presets() {
  const { currHighlithedNav } = useAppContext();
  const { isConnected, lastAction, setLastAction } = useBLE();
  const { phrases } = useOnboarding();

  const numCols = 3;
  const [presetArray, setPresetArray] = useState(phrases);

  // Update presets when they change in the onboarding context
  useEffect(() => {
    if (phrases && phrases.length > 0) {
      setPresetArray(phrases);
    }
  }, [phrases]);

  const [selectedPreset, setSelectedPreset] = useState(0);

  const [isButtonHighlighted, setIsButtonHighlighted] = useState(false);
  const [highlightedButton, setHighlightedButton] = useState(0); // 0 for Settings, 1 for Word Builder

  const { width } = Dimensions.get("window");
  const isSmallDevice = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const pathname = usePathname();
  const isPresetPage = pathname === "/presets";

  // Use the grid scroll hook
  const { handleItemLayout, safeScrollToPosition, getListProps } =
    useGridScroll({
      numCols,
      isSmallDevice,
    });

  // Auto-scroll to the selected preset
  useEffect(() => {
    safeScrollToPosition(
      selectedPreset,
      presetArray.length,
      isButtonHighlighted
    );
  }, [selectedPreset, isButtonHighlighted, presetArray.length]);

  // Define the action handler to avoid code duplication
  const handlePresetAction = () => {
    const phrase = `${presetArray[selectedPreset]?.text || ""}`;
    console.log("Preset Page:", phrase);
    speakText(phrase);
  };

  // Define button action handler
  const handleButtonAction = () => {
    setLastAction("none"); // Reset last action to avoid conflicts
    if (highlightedButton === 0) {
      router.push("../(home)/settings");
    } else {
      router.push("./sentence-builder");
    }
  };

  const handlePreset = (actionType: NavAction) => {
    if (actionType === "none") return; // Ignore if no action

    // Handle button navigation when buttons are highlighted
    if (isButtonHighlighted) {
      if (actionType === "up") {
        // Move back to the preset grid
        setIsButtonHighlighted(false);
      } else if (actionType === "left" || actionType === "right") {
        // Toggle between buttons
        setHighlightedButton(highlightedButton === 0 ? 1 : 0);
      } else if (actionType === "action") {
        // Perform button action
        handleButtonAction();
      }
      return;
    }

    // Check if we're in the bottom row and going down
    const isLastRow =
      Math.floor(selectedPreset / numCols) ===
      Math.floor((presetArray.length - 1) / numCols);

    if (actionType === "down" && isLastRow) {
      setIsButtonHighlighted(true);
      return;
    }

    // Regular preset grid navigation
    let nextPreset = handleInput({
      currHighlithedNav: actionType,
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

  // Handle tap event (manual input)
  const handleTap = () => {
    handlePreset(currHighlithedNav);
  };

  // Handle last action event (BLE input)
  useEffect(() => {
    if (!isPresetPage) return;
    if (!isConnected) {
      console.error("Presets Page: Not connected, ignoring last action.");
      return;
    }
    console.log("Last Action (Presets):", lastAction);
    handlePreset(lastAction);
  }, [lastAction]);

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
        selectedPreset === index &&
          !isButtonHighlighted &&
          styles.selectedPreset,
      ]}
      onLayout={index === 0 ? handleItemLayout : undefined}
      className="flex-center"
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
        extraData={[selectedPreset, isButtonHighlighted]} // Ensure re-render when selection changes
      />
      <View className="flex flex-row justify-around items-center p-1 gap-1 mt-2">
        <Pressable
          onPress={() => {
            router.push("../(home)/settings");
          }}
          style={[
            styles.navigationButton,
            { backgroundColor: "#89CDFF" },
            isButtonHighlighted &&
              highlightedButton === 0 &&
              styles.selectedButton,
          ]}
          className="rounded-[64px] px-3"
        >
          <Text className="text-center text-lg">Settings</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            router.push("./sentence-builder");
          }}
          style={[
            styles.navigationButton,
            { backgroundColor: "#89CDFF" },
            isButtonHighlighted &&
              highlightedButton === 1 &&
              styles.selectedButton,
          ]}
          className="rounded-[64px] px-3"
        >
          <Text className="text-center text-lg">Sentence Builder</Text>
        </Pressable>
      </View>
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
  navigationButton: {
    paddingHorizontal: 16,
    borderRadius: 64,
  },
  selectedButton: {
    backgroundColor: "#ADFF5B",
  },
});
