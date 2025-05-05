import { TOUCH_SENSOR_IDENTIFIER_PREFIX } from "@/lib/Config";
import { MOCK_DATA } from "@/lib/constants/Data";
import { useAppContext } from "@/lib/context/AppContext";
import { useBLE } from "@/lib/context/BLEContext";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useGridScroll } from "@/lib/hooks/useGridScroll";
import { NavAction } from "@/lib/types";
import { getSuggestions } from "@/lib/utils/apiCalls";
import { handleInput } from "@/lib/utils/handleInput";
import { speakText } from "@/lib/utils/speakText";
import { router, usePathname } from "expo-router";
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

export default function SentenceBuilder() {
  const { currHighlithedNav, textAreaValue, setTextAreaValue } =
    useAppContext();
  const { isConnected, lastAction, setLastAction, currDeviceType } = useBLE();
  const { phrases, setPhrases } = useOnboarding();

  const numCols = 3;
  const [wordArray, setWordArray] = useState(MOCK_DATA);

  const [selectedWord, setSelectedWord] = useState(0);
  const [sentence, setSentence] = useState(textAreaValue);

  const [isTopButtonHighlighted, setIsTopButtonHighlighted] = useState(false);
  const [highlightedButton, setHighlightedButton] = useState(0); // 0 for Clear, 1 for Speak
  const [isBottomButtonHighlighted, setIsBottomButtonHighlighted] =
    useState(false);
  const [bottomHighlightedButton, setBottomHighlightedButton] = useState(0); // 0 for Back, 1 for Word Builder

  const { width } = Dimensions.get("window");
  const isSmallDevice = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const imageSize = isSmallDevice ? 20 : 36;

  const pathname = usePathname();
  const isSentencePage = pathname === "/sentence-builder";

  // Use the grid scroll hook
  const { handleItemLayout, safeScrollToPosition, getListProps } =
    useGridScroll({
      numCols,
      isSmallDevice,
    });

  // Auto-scroll to the selected word
  useEffect(() => {
    safeScrollToPosition(
      selectedWord,
      wordArray.length,
      isTopButtonHighlighted || isBottomButtonHighlighted
    );
  }, [
    selectedWord,
    isTopButtonHighlighted,
    isBottomButtonHighlighted,
    wordArray.length,
  ]);

  useEffect(() => {
    setTextAreaValue(sentence);
  }, [sentence]);

  useEffect(() => {
    if(sentence === "") return;
    const fetchSuggestions = async () => {
      const newWordSuggestions = await getSuggestions({
        sentence,
        numTokens: 9,
        type: "sentence-builder",
      });
      setWordArray(newWordSuggestions);
    };
    fetchSuggestions();
  }, [sentence]);

  // Helper function for adding words to sentence
  const addWordToSentence = async (word: string) => {
    setSentence((prev) => {
      if (prev === "") {
        return word;
      }
      return `${prev} ${word}`;
    });
  };

  // Define action handlers to avoid code duplication
  const handleWordAction = () => {
    if (!isTopButtonHighlighted && !isBottomButtonHighlighted) {
      if (selectedWord >= 0 && selectedWord < wordArray.length) {
        const word = wordArray[selectedWord];
        addWordToSentence(word);
      }
    }
  };

  const handleButtonAction = () => {
    if (highlightedButton === 0) {
      setSentence(""); // Clear action
    } else {
      console.log("Sentence page:", sentence);
      speakText(sentence);
      setPhrases([...phrases, sentence]);
    }
  };

  // Handle navigation button actions
  const handleNavButtonAction = () => {
    setLastAction("none"); // Reset last action to avoid conflicts
    if (bottomHighlightedButton === 0) {
      router.push("./presets");
    } else {
      router.push("./word-builder");
    }
  };

  const handleSentence = (actionType: NavAction) => {
    if(actionType === "none") return; // Ignore if no action
    
    // Handle button navigation when buttons are highlighted
    if (isBottomButtonHighlighted) {
      if (actionType === "up") {
        // Move back to the word grid
        setIsBottomButtonHighlighted(false);
        return;
      } else if (
        actionType === "left" ||
        actionType === "right"
      ) {
        // Toggle between bottom navigation buttons
        setBottomHighlightedButton(bottomHighlightedButton === 0 ? 1 : 0);
        return;
      } else if (actionType === "action") {
        // Perform navigation button action
        handleNavButtonAction();
        return;
      }
      return;
    }

    // Handle top button navigation (Clear and Speak buttons)
    if (isTopButtonHighlighted) {
      if (actionType === "down") {
        // Move back to the word grid
        setIsTopButtonHighlighted(false);
        return;
      } else if (
        actionType === "left" ||
        actionType === "right"
      ) {
        // Toggle between top buttons
        setHighlightedButton(highlightedButton === 0 ? 1 : 0);
        return;
      } else if (actionType === "action") {
        // Perform button action
        handleButtonAction();
        return;
      }
      return;
    }

    // Check if we're in the top row and going up
    if (actionType === "up" && selectedWord < numCols) {
      setIsTopButtonHighlighted(true);
      return;
    }

    // Check if we're in the bottom row and going down
    const isLastRow =
      Math.floor(selectedWord / numCols) ===
      Math.floor((wordArray.length - 1) / numCols);
    if (actionType === "down" && isLastRow) {
      setIsBottomButtonHighlighted(true);
      return;
    }

    // Regular word grid navigation
    let nextWord = handleInput({
      currHighlithedNav: actionType,
      array: wordArray,
      index: selectedWord,
      numCols,
      onAction: handleWordAction,
    });

    // Ensure we have a valid index
    if (nextWord >= 0 && nextWord < wordArray.length) {
      setSelectedWord(nextWord);
    }
  }

  // Handle tap event (manual input)
  const handleTap = () => {
    handleSentence(currHighlithedNav);
  };

  useEffect(() => {
    if (!isSentencePage || lastAction === "none") return;
    console.log("Last Action (Sentence):", lastAction);
    if (!isConnected) {
      // console.error("Sentence Builder: Not connected, ignoring last action.");
      return;
    }
    if(currDeviceType === TOUCH_SENSOR_IDENTIFIER_PREFIX) handleSentence(lastAction);
    else {
      handleSentence(currHighlithedNav);
    }
  }, [lastAction]);

  const WordItem = ({
    item,
    index,
  }: {
    item: (typeof wordArray)[0];
    index: number;
  }) => (
    <View
      style={[
        styles.wordCard,
        selectedWord === index &&
          !isTopButtonHighlighted &&
          !isBottomButtonHighlighted &&
          styles.selectedWord,
      ]}
      onLayout={index === 0 ? handleItemLayout : undefined}
    >
      <Text style={[styles.wordText, isSmallDevice && styles.smallDeviceText]}>
        {item}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={() => handleTap()}
      className="flex-1 p-2 md:p-4 bg-[#72919E]"
    >
      <Text
        className={`text-6xl font-semibold px-2 mb-2 md:mb-4`}
      >
        Sentence Builder
      </Text>

      <View style={styles.textArea} className="m-1 p-1">
        <View style={styles.inputContainer}>
          <Text
            style={[
              styles.displayText,
            ]}
          >
            {sentence}
          </Text>
        </View>
        <View className="flex flex-row items-center p-1 gap-1">
          <View>
            <Pressable
              onPress={() => setSentence("")}
              style={[
                styles.textAreaBtn,
                { backgroundColor: "#f00" },
                isTopButtonHighlighted &&
                  highlightedButton === 0 &&
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
                speakText(sentence);
              }}
              style={[
                styles.textAreaBtn,
                { backgroundColor: "#73C4FF" },
                isTopButtonHighlighted &&
                  highlightedButton === 1 &&
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
      <FlatList
        {...getListProps()}
        data={wordArray}
        renderItem={WordItem}
        numColumns={numCols}
        initialNumToRender={wordArray.length}
        maxToRenderPerBatch={wordArray.length}
        windowSize={21}
        extraData={[
          selectedWord,
          isTopButtonHighlighted,
          isBottomButtonHighlighted,
        ]} // Ensure re-render when selection changes
      />
      <View className="flex flex-row justify-around items-center p-1 gap-1 mt-2">
        <Pressable
          onPress={() => router.push("./presets")}
          style={[
            styles.navigationButton,
            { backgroundColor: "#89CDFF" },
            isBottomButtonHighlighted &&
              bottomHighlightedButton === 0 &&
              styles.selectedButton,
          ]}
        >
          <Text style={styles.navigationButtonText}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("./word-builder")}
          style={[
            styles.navigationButton,
            { backgroundColor: "#89CDFF" },
            isBottomButtonHighlighted &&
              bottomHighlightedButton === 1 &&
              styles.selectedButton,
          ]}
        >
          <Text style={styles.navigationButtonText}>Word Builder</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  textArea: {
    borderRadius: 8,
    backgroundColor: "#fff",
    flexDirection: "row",
  },
  textAreaBtn: {
    color: "#fff",
    borderRadius: 8,
    padding: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  smallButtonText: {
    fontSize: 12,
  },
  inputContainer: {
    flex: 1,
    padding: 4,
  },
  displayText: {
    fontSize: 28,
    color: "#000",
  },
  smallDeviceText: {
    fontSize: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 40,
  },
  wordCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    margin: 4,
  },
  selectedWord: {
    backgroundColor: "#ADFF5B",
  },
  wordText: {
    color: "#000",
    fontSize: 28,
    textAlign: "center",
  },
  wordGrid: {
    gap: 12,
  },

  navigationButton: {
    paddingHorizontal: 12,
    borderRadius: 64,
  },
  navigationButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  selectedButton: {
    backgroundColor: "#ADFF5B",
  },
});
