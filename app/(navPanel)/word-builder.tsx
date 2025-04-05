import { MOCK_WORDS } from "@/lib/constants/Data";
import { useAppContext } from "@/lib/context/AppContext";
import { useBLE } from "@/lib/context/BLEContext";
import { useBLEInput } from "@/lib/hooks/useBLEInput";
import { handleInput } from "@/lib/utils/handleInput";
import { speakText } from "@/lib/utils/speakText";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function WordBuilder() {
  const [phrase, setPhrase] = useState("");
  const [selectedKey, setSelectedKey] = useState(0);
  const [suggestions, setSuggestions] = useState(MOCK_WORDS);
  const [isTopButtonHighlighted, setIsTopButtonHighlighted] = useState(false);
  const [isSuggestionHighlighted, setIsSuggestionHighlighted] = useState(false);
  const [isBottomButtonHighlighted, setIsBottomButtonHighlighted] =
    useState(false);
  const [topHighlightedButton, setTopHighlightedButton] = useState(0); // 0 for Clear, 1 for Done
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] =
    useState(0);
  const [bottomHighlightedButton, setBottomHighlightedButton] = useState(0); // 0 for Clear, 1 for Done
  const { currHighlithedNav } = useAppContext();
  const { isConnected } = useBLE();
  const { width } = Dimensions.get("window");
  const isSmallDevice = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const numCols = 12;

  // Image size based on device size
  const imageSize = isSmallDevice ? 20 : isTablet ? 24 : 36;

  const keyboard = [..."abcdefghijklmnopqrstuvwxyz0123456789".split("")];

  const handleKeyPress = (key: string) => {
    setPhrase((prev) => prev + key);
  };

  const handleTopButtonAction = () => {
    if (topHighlightedButton === 0) {
      setPhrase(""); // Clear action
    } else {
      speakText(phrase); // Done action
    }
  };

  const handleSuggestionAction = () => {
    const selectedSuggestion = suggestions[highlightedSuggestionIndex];
    console.log(selectedSuggestion);
    // TODO: Send this to the sentence builder page and append to the sentance in the sentence builder page
  };

  const handleBottomButtonAction = () => {
    if (bottomHighlightedButton === 0) {
      setPhrase((prev) => prev + " "); // Space action
    } else {
      setPhrase((prev) => prev.slice(0, -1)); // Backspace action
    }
  };

  const handleCombinedAction = () => {
    if (isTopButtonHighlighted) {
      handleTopButtonAction();
    } else if (isSuggestionHighlighted) {
      handleSuggestionAction();
    } else if (isBottomButtonHighlighted) {
      handleBottomButtonAction();
    } else {
      handleKeyPress(keyboard[selectedKey]);
    }
  };

  const { currentIndex } = useBLEInput({
    array: keyboard,
    index: selectedKey,
    numCols,
    onAction: handleCombinedAction,
    isEnabled:
      isConnected && !isTopButtonHighlighted && !isBottomButtonHighlighted,
  });

  useEffect(() => {
    if (!isTopButtonHighlighted && !isBottomButtonHighlighted) {
      setSelectedKey(currentIndex);
    }
  }, [currentIndex]);

  const handleTap = () => {
    if (isTopButtonHighlighted) {
      if (currHighlithedNav === "down") {
        // Move back to the keyboard grid
        setIsTopButtonHighlighted(false);
        setIsSuggestionHighlighted(true);
      } else if (
        currHighlithedNav === "left" ||
        currHighlithedNav === "right"
      ) {
        // Toggle between top buttons
        setTopHighlightedButton(topHighlightedButton === 0 ? 1 : 0);
      } else if (currHighlithedNav === "action") {
        // Perform top button action
        handleTopButtonAction();
      }
      return;
    }

    if (isSuggestionHighlighted) {
      switch (currHighlithedNav) {
        case "up":
          setIsSuggestionHighlighted(false);
          setIsTopButtonHighlighted(true);
          break;
        case "down":
          setIsSuggestionHighlighted(false);
          break;
        case "left":
          setHighlightedSuggestionIndex((prev) => {
            let newIdx = (prev - 1 + suggestions.length) % suggestions.length;
            return newIdx;
          });
          break;
        case "right":
          setHighlightedSuggestionIndex((prev) => {
            let newIdx = (prev + 1) % suggestions.length;
            return newIdx;
          });
          break;
        case "action":
          handleSuggestionAction();
          break;
        default:
          break;
      }
      return;
    }

    if (isBottomButtonHighlighted) {
      if (currHighlithedNav === "up") {
        // Move back to the keyboard grid
        setIsBottomButtonHighlighted(false);
      } else if (
        currHighlithedNav === "left" ||
        currHighlithedNav === "right"
      ) {
        // Toggle between bottom buttons
        setBottomHighlightedButton(bottomHighlightedButton === 0 ? 1 : 0);
      } else if (currHighlithedNav === "action") {
        // Perform bottom button action
        handleBottomButtonAction();
      }
      return;
    }

    const isLastRow =
      Math.floor(selectedKey / numCols) ===
      Math.floor((keyboard.length - 1) / numCols);

    const isFirstRow = Math.floor(selectedKey / numCols) === 0;

    if (currHighlithedNav === "up" && isFirstRow) {
      setIsSuggestionHighlighted(true);
    } else if (currHighlithedNav === "down" && isLastRow) {
      setIsBottomButtonHighlighted(true);
    } else {
      const nextKey = handleInput({
        currHighlithedNav,
        array: keyboard,
        index: selectedKey,
        numCols,
        onAction: handleCombinedAction,
      });
      setSelectedKey(nextKey);
    }
  };

  return (
    <Pressable onPress={handleTap} className="flex-1 p-2 md:p-4 bg-[#72919E]">
      <Text
        className={`${
          isSmallDevice ? "text-2xl" : "text-4xl"
        } font-semibold px-2 mb-2 md:mb-4`}
      >
        Word Builder
      </Text>
      <View className="flex-1 flex-col">
        <View style={styles.textArea} className="m-1 p-1 flex-row">
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.displayText,
                isSmallDevice && styles.smallDeviceText,
              ]}
            >
              {phrase}
            </Text>
          </View>
          <View className="flex flex-row items-center p-1 gap-1">
            <View>
              <Pressable
                onPress={() => setPhrase("")}
                style={[
                  styles.textAreaBtn,
                  { backgroundColor: "#f00" },
                  isTopButtonHighlighted &&
                    topHighlightedButton === 0 &&
                    styles.selectedButton,
                ]}
              >
                <Image
                  source={require("@/assets/images/close.png")}
                  style={{ width: imageSize, height: imageSize }}
                />
              </Pressable>
            </View>
            <View>
              <Pressable
                onPress={() => {
                  speakText(phrase);
                }}
                style={[
                  styles.textAreaBtn,
                  { backgroundColor: "#73C4FF" },
                  isTopButtonHighlighted &&
                    topHighlightedButton === 1 &&
                    styles.selectedButton,
                ]}
              >
                <Image
                  source={require("@/assets/images/arrow.png")}
                  style={{
                    width: imageSize,
                    height: imageSize,
                    transform: [{ rotate: "90deg" }],
                  }}
                />
              </Pressable>
            </View>
          </View>
        </View>
        <View className="flex-center my-2">
          <FlatList
            data={suggestions}
            horizontal
            renderItem={({ item, index }) => (
              <View
                style={[
                  styles.suggestion,
                  isSuggestionHighlighted &&
                    highlightedSuggestionIndex === index &&
                    styles.selectedKey,
                ]}
              >
                <Text style={styles.suggestionText}>{item.data}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            style={styles.suggestionList}
          />
        </View>
        <View className="border-4 border-white rounded-lg p-1">
          <FlatList
            data={keyboard}
            numColumns={numCols}
            renderItem={({ item, index }) => (
              <View
                style={[
                  styles.key,
                  selectedKey === index &&
                    !isTopButtonHighlighted &&
                    !isSuggestionHighlighted &&
                    !isBottomButtonHighlighted &&
                    styles.selectedKey,
                ]}
              >
                <Text style={styles.keyText}>{item}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            style={styles.keyboard}
            className="my-auto"
          />
        </View>
      </View>
      <View className="flex flex-row justify-around items-center mt-2">
        <Pressable
          onPress={() => setPhrase((prev) => prev + " ")}
          style={[
            styles.bottomButton,
            isBottomButtonHighlighted &&
              bottomHighlightedButton === 0 &&
              styles.selectedButton,
          ]}
        >
          <Text className="text-center text-lg">Space</Text>
        </Pressable>
        <Pressable
          onPress={() => setPhrase((prev) => prev.slice(0, -1))}
          style={[
            styles.bottomButton,
            isBottomButtonHighlighted &&
              bottomHighlightedButton === 1 &&
              styles.selectedButton,
          ]}
        >
          <Text className="text-center text-lg">Backspace</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  textArea: {
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 8,
    marginBottom: 8,
  },
  displayText: {
    fontSize: 16,
    color: "#000",
  },
  smallDeviceText: {
    fontSize: 14,
  },
  textAreaBtn: {
    padding: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  selectedButton: {
    backgroundColor: "#ADFF5B",
  },
  suggestionList: {
    marginBottom: 8,
  },
  suggestion: {
    backgroundColor: "#FBFEFF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  suggestionText: {
    fontSize: 16,
    color: "#000",
  },
  keyboard: {
    marginBottom: 8,
  },
  inputContainer: {
    flex: 1,
    padding: 4,
  },
  key: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 4,
    margin: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedKey: {
    backgroundColor: "#ADFF5B",
  },
  keyText: {
    fontSize: 16,
    color: "#000",
  },
  bottomButton: {
    backgroundColor: "#89CDFF",
    paddingHorizontal: 16,
    borderRadius: 64,
  },
});
