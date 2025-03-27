import { useAppContext } from "@/lib/context/AppContext";
import { useBLE } from "@/lib/context/BLEContext";
import { MOCK_DATA } from "@/lib/constants/Data";
import { handleInput } from "@/lib/utils/handleInput";
import { speakText } from "@/lib/utils/speakText";
import { useBLEInput } from "@/lib/hooks/useBLEInput";
import { useGridScroll } from "@/lib/hooks/useGridScroll";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  Dimensions,
  View,
} from "react-native";

export default function WordBuilder() {
  const [selectedWord, setSelectedWord] = useState(0);
  const [sentence, setSentence] = useState("");
  const { currHighlithedNav } = useAppContext();
  const numCols = 3;
  const [wordArray, setWordArray] = useState(MOCK_DATA);
  const [isButtonHighlighted, setIsButtonHighlighted] = useState(false);
  const [highlightedButton, setHighlightedButton] = useState(0); // 0 for Clear, 1 for Speak
  const { isConnected } = useBLE();
  const { width } = Dimensions.get("window");
  const isSmallDevice = width < 768;

  // Use the grid scroll hook
  const { handleItemLayout, safeScrollToPosition, getListProps } =
    useGridScroll({
      numCols,
      isSmallDevice,
    });

  // Use the BLE input hook
  const { currentIndex } = useBLEInput({
    array: wordArray,
    index: selectedWord,
    numCols,
    onAction: () => {
      if (!isButtonHighlighted) {
        if (selectedWord >= 0 && selectedWord < wordArray.length) {
          const word = wordArray[selectedWord].data;
          addWordToSentence(word);
        }
      } else {
        if (highlightedButton === 0) {
          setSentence(""); // Clear action
        } else {
          console.log(sentence);
          speakText(sentence);
        }
      }
    },
    isEnabled: isConnected, // Only enable when connected
  });

  // Update selected word when BLE input changes
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < wordArray.length) {
      setSelectedWord(currentIndex);
    }
  }, [currentIndex, wordArray.length]);

  // Auto-scroll to the selected word
  useEffect(() => {
    safeScrollToPosition(selectedWord, wordArray.length, isButtonHighlighted);
  }, [selectedWord, isButtonHighlighted, wordArray.length]);

  // Use the helper function when adding words
  const addWordToSentence = (word: string) => {
    setSentence((prev) => {
      if (prev === "") {
        return word;
      }
      return `${prev} ${word}`;
    });
  };

  // Handle tap event (manual input)
  const handleTap = () => {
    // Handle button navigation when buttons are highlighted
    if (isButtonHighlighted) {
      if (currHighlithedNav === "down") {
        // Move back to the word grid
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
        if (highlightedButton === 0) {
          setSentence(""); // Clear action
        } else {
          // Speak action with enhanced pronunciation
          console.log(sentence);
          speakText(sentence);
        }
        return;
      }
      return;
    }

    // Check if we're in the top row and going up
    if (currHighlithedNav === "up" && selectedWord < numCols) {
      setIsButtonHighlighted(true);
      return;
    }

    // Regular word grid navigation
    let nextWord = handleInput({
      currHighlithedNav,
      array: wordArray,
      index: selectedWord,
      numCols,
      onAction: () => {
        if (selectedWord >= 0 && selectedWord < wordArray.length) {
          const word = wordArray[selectedWord].data;
          addWordToSentence(word);
        }
      },
    });

    // Ensure we have a valid index
    if (nextWord >= 0 && nextWord < wordArray.length) {
      setSelectedWord(nextWord);
    }
  };

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
        selectedWord === index && !isButtonHighlighted && styles.selectedWord,
      ]}
      onLayout={index === 0 ? handleItemLayout : undefined}
    >
      <Text style={[styles.wordText, isSmallDevice && styles.smallDeviceText]}>
        {item.data}
      </Text>
    </View>
  );

  return (
    <Pressable onPress={() => handleTap()} className="flex-1 p-2 md:p-4">
      <Text
        className={`${
          isSmallDevice ? "text-2xl" : "text-4xl"
        } font-semibold px-2 mb-2 md:mb-4`}
      >
        Word Builder
      </Text>

      <View
        style={styles.textArea}
        className="px-2 py-2 m-1 md:px-4 md:py-2 md:m-2"
      >
        <View style={styles.inputContainer}>
          <Text
            style={[
              styles.displayText,
              isSmallDevice && styles.smallDeviceText,
            ]}
          >
            {sentence}
          </Text>
        </View>
        <View className="flex flex-row justify-between px-2 py-1 md:px-4 md:py-2 gap-1 md:gap-2">
          <Pressable
            onPress={() => setSentence("")}
            style={[
              styles.textAreaBtn,
              { backgroundColor: "#f00" },
              isButtonHighlighted &&
                highlightedButton === 0 &&
                styles.selectedButton,
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                isSmallDevice && styles.smallButtonText,
              ]}
            >
              Clear
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              speakText(sentence);
            }}
            style={[
              styles.textAreaBtn,
              { backgroundColor: "#0f0" },
              isButtonHighlighted &&
                highlightedButton === 1 &&
                styles.selectedButton,
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                isSmallDevice && styles.smallButtonText,
              ]}
            >
              Speak
            </Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        {...getListProps()}
        data={wordArray}
        renderItem={WordItem}
        numColumns={numCols}
        keyExtractor={(item) => item.id}
        initialNumToRender={wordArray.length}
        maxToRenderPerBatch={wordArray.length}
        windowSize={21}
        extraData={selectedWord} // Ensure re-render when selection changes
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  textArea: {
    borderColor: "#333",
    borderWidth: 1,
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
    fontSize: 16,
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
    backgroundColor: "transparent",
    borderRadius: 8,
    padding: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: "#333",
  },
  selectedWord: {
    borderColor: "#00f",
    borderWidth: 4,
  },
  wordText: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
  },
  wordGrid: {
    gap: 12,
  },
  selectedButton: {
    borderColor: "#00f",
    borderWidth: 2,
  },
});
