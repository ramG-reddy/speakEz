import { useAppContext } from "@/context/AppContext";
import { useBLE } from "@/context/BLEContext";
import { MOCK_DATA } from "@/lib/constants/Data";
import { handleInput } from "@/lib/utils/handleInput";
import { speakText } from "@/lib/utils/speakText";
import { useBLEInput } from "@/hooks/useBLEInput";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

export default function WordBuilder() {
  const [selectedWord, setSelectedWord] = useState(0);
  const [sentence, setSentence] = useState("");
  const { currHighlithedNav } = useAppContext();
  const numCols = 3;
  const [wordArray, setWordArray] = useState(MOCK_DATA);
  const [isButtonHighlighted, setIsButtonHighlighted] = useState(false);
  const [highlightedButton, setHighlightedButton] = useState(0); // 0 for Clear, 1 for Speak
  const { isConnected, startScan } = useBLE();

  // Use the BLE input hook
  const { currentIndex } = useBLEInput({
    array: wordArray,
    index: selectedWord,
    numCols,
    onAction: () => {
      if (!isButtonHighlighted) {
        const word = wordArray[selectedWord].data;
        addWordToSentence(word);
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
    setSelectedWord(currentIndex);
  }, [currentIndex]);

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
        const word = wordArray[selectedWord].data;
        addWordToSentence(word);
      },
    });
    setSelectedWord(nextWord);
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
    >
      <Text style={styles.wordText}>{item.data}</Text>
    </View>
  );

  return (
    <Pressable onPress={() => handleTap()} className="flex-1 p-4">
      <Text className="text-4xl font-semibold px-2 mb-4">Word Builder</Text>

      {/* BLE Connection Button */}
      {!isConnected && (
        <TouchableOpacity
          onPress={startScan}
          style={styles.bleButton}
          className="mb-4"
        >
          <Text style={styles.bleButtonText}>Connect BLE Device</Text>
        </TouchableOpacity>
      )}

      {/* Rest of the component remains the same */}
      <View style={styles.textArea} className="px-4 py-2 m-2">
        <View style={styles.inputContainer}>
          <Text style={styles.displayText}>{sentence}</Text>
        </View>
        <View className="flex flex-row justify-between px-4 py-2 gap-2">
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
            <Text style={styles.buttonText}>Clear</Text>
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
            <Text style={styles.buttonText}>Speak</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={wordArray}
        renderItem={WordItem}
        numColumns={numCols}
        keyExtractor={(item) => item.id}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bleButton: {
    backgroundColor: "#4287f5",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  bleButtonText: {
    color: "white",
    fontWeight: "bold",
  },
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
  },
  inputContainer: {
    flex: 1,
  },
  displayText: {
    fontSize: 16,
    color: "#000",
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
    padding: 16,
    margin: 8,
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
  },
  wordGrid: {
    gap: 12,
  },
  selectedButton: {
    borderColor: "#00f",
    borderWidth: 2,
  },
});
