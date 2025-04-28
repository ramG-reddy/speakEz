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
import { usePathname } from "expo-router";

export default function Presets() {
  const { currHighlithedNav } = useAppContext();
  const { isConnected, lastAction, setLastAction } = useBLE();

  const numCols = 3;
  const [presetArray, setPresetArray] = useState(PRESETS);

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

  // Combined action handler for both presets and buttons
  const handleCombinedAction = () => {
    if (isButtonHighlighted) {
      handleButtonAction();
    } else {
      handlePresetAction();
    }
  };

  // Auto-scroll to the selected preset
  useEffect(() => {
    safeScrollToPosition(
      selectedPreset,
      presetArray.length,
      isButtonHighlighted
    );
  }, [selectedPreset, isButtonHighlighted, presetArray.length]);

  // Handle tap event (manual input)
  const handleTap = () => {
    // Handle button navigation when buttons are highlighted
    if (isButtonHighlighted) {
      if (currHighlithedNav === "up") {
        // Move back to the preset grid
        setIsButtonHighlighted(false);
        return;
      } else if (
        currHighlithedNav === "left" ||
        currHighlithedNav === "right"
      ) {
        // Toggle between buttons
        setHighlightedButton(highlightedButton === 0 ? 1 : 0);
        return;
      } else if (currHighlithedNav === "action") {
        // Perform button action
        handleButtonAction();
        return;
      }
      return;
    }

    // Check if we're in the bottom row and going down
    const isLastRow =
      Math.floor(selectedPreset / numCols) ===
      Math.floor((presetArray.length - 1) / numCols);
    if (currHighlithedNav === "down" && isLastRow) {
      setIsButtonHighlighted(true);
      return;
    }

    // Regular preset grid navigation
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

  // // Use the BLE input hook to respond to hardware controls for presets
  // const { newIndex } = useBLEInput({
  //   array: presetArray,
  //   index: selectedPreset,
  //   numCols,
  //   onAction: handleCombinedAction,
  //   isEnabled: isConnected && !isButtonHighlighted, // Only enable when connected and not on buttons
  // });

  // // Update selected preset when BLE input changes
  // useEffect(() => {
  //   if (
  //     !isButtonHighlighted &&
  //     newIndex >= 0 &&
  //     newIndex < presetArray.length
  //   ) {
  //     setSelectedPreset(newIndex);
  //   }
  // }, [newIndex, presetArray.length, isButtonHighlighted]);

  useEffect(() => {
    // console.log("Path", pathname)
    if (!isPresetPage || lastAction === "none") return;
    console.log("Last Action (Presets):", lastAction);
    if (isButtonHighlighted) {
      if (lastAction === "up") {
        // Move back to the preset grid
        setIsButtonHighlighted(false);
        return;
      } else if (
        lastAction === "left" ||
        lastAction === "right"
      ) {
        // Toggle between buttons
        setHighlightedButton(highlightedButton === 0 ? 1 : 0);
        return;
      } else if (lastAction === "action") {
        // Perform button action
        handleButtonAction();
        return;
      }
      return;
    }

    // Check if we're in the bottom row and going down
    const isLastRow =
      Math.floor(selectedPreset / numCols) ===
      Math.floor((presetArray.length - 1) / numCols);
    if (lastAction === "down" && isLastRow) {
      setIsButtonHighlighted(true);
      return;
    }

    // Regular preset grid navigation
    let nextPreset = handleInput({
      currHighlithedNav: lastAction,
      array: presetArray,
      index: selectedPreset,
      numCols,
      onAction: handlePresetAction,
    });

    // Ensure we have a valid index
    if (nextPreset >= 0 && nextPreset < presetArray.length) {
      setSelectedPreset(nextPreset);
    }
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
