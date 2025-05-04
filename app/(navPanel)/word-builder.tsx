import { MOCK_WORDS } from "@/lib/constants/Data";
import { useAppContext } from "@/lib/context/AppContext";
import { useBLE } from "@/lib/context/BLEContext";
import { useBLEInput } from "@/lib/hooks/useBLEInput";
import { handleInput } from "@/lib/utils/handleInput";
import { speakText } from "@/lib/utils/speakText";
import { router } from "expo-router";
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
import { usePathname } from "expo-router";
import { NavAction } from "@/lib/types";
import { getSuggestions } from "@/lib/utils/apiCalls";

export default function WordBuilder() {
  const { currHighlithedNav, textAreaValue, setTextAreaValue } = useAppContext();
  const { isConnected, lastAction, setLastAction } = useBLE();
  const numCols = 12;
  const [suggestionsArray, setSuggestionsArray] = useState(MOCK_WORDS);

  const [halfWord, setHalfWord] = useState("");
  const [selectedKey, setSelectedKey] = useState(0);

  const [isTopButtonHighlighted, setIsTopButtonHighlighted] = useState(false);
  const [isSuggestionHighlighted, setIsSuggestionHighlighted] = useState(false);
  const [isBottomButtonHighlighted, setIsBottomButtonHighlighted] =
    useState(false);
  const [topHighlightedButton, setTopHighlightedButton] = useState(0); // 0 for Clear, 1 for Done
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] =
    useState(0);
  const [bottomHighlightedButton, setBottomHighlightedButton] = useState(0); // 0 for Clear, 1 for Done

  const { width } = Dimensions.get("window");
  const isSmallDevice = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const imageSize = isSmallDevice ? 20 : isTablet ? 24 : 36;

  const pathname = usePathname();
  const isWordBuilderPage = pathname === "/word-builder";

  const keyboard = [..."abcdefghijklmnopqrstuvwxyz0123456789".split("")];

  useEffect(() => {
    if(halfWord.length < 1) return; // Ignore if halfWord is empty
    if(!isWordBuilderPage) return; // Ignore if not on the word builder page
    const fetchSuggestions = async () => {
      const newSentence = textAreaValue.trim() + " " + halfWord.trim();
      const newWordSuggestions = await getSuggestions({
        sentence: newSentence,
        numTokens: 3,
        type: "word-builder",
      });
      setSuggestionsArray(newWordSuggestions);
    };

    fetchSuggestions();
  }, [halfWord]);

  const handleKeyPress = (key: string) => {
    setHalfWord((prev) => prev + key);
  };

  const addToSentence = (data: string) => {
    const newSentence = textAreaValue.trim()+ " " + data.trim();
    setTextAreaValue(newSentence);
  }

  const handleTopButtonAction = () => {
    if (topHighlightedButton === 0) {
      setHalfWord(""); // Clear action
    } else {
      addToSentence(halfWord); // Done action
      setHalfWord(""); // Clear the halfWord after sending it to the sentence builder page
      setLastAction("none"); // Reset last action to avoid conflicts
      router.push("./sentence-builder"); // Navigate to the sentence builder page
    }
  };

  const handleSuggestionAction = () => {
    const selectedSuggestion = suggestionsArray[highlightedSuggestionIndex];
    console.log("handleSuggestion Word Page:",selectedSuggestion);
    addToSentence(selectedSuggestion); // Add the selected suggestion to the sentence
    setHalfWord("");
    setLastAction("none"); // Reset last action to avoid conflicts
    router.push("./sentence-builder"); // Navigate to the sentence builder page
  };

  const handleBottomButtonAction = () => {
    if (bottomHighlightedButton === 0) {
      setHalfWord((prev) => prev + " "); // Space action
    } else {
      setHalfWord((prev) => prev.slice(0, -1)); // Backspace action
    }
  };

  const handleWord = (actionType: NavAction) => {
    if(actionType === "none") return; // Ignore if no action

    if (isTopButtonHighlighted) {
      if (actionType === "down") {
        // Move back to the keyboard grid
        setIsTopButtonHighlighted(false);
        setIsSuggestionHighlighted(true);
      } else if (
        actionType === "left" ||
        actionType === "right"
      ) {
        // Toggle between top buttons
        setTopHighlightedButton(topHighlightedButton === 0 ? 1 : 0);
      } else if (actionType === "action") {
        // Perform top button action
        handleTopButtonAction();
      }
      return;
    }

    if (isSuggestionHighlighted) {
      switch (actionType) {
        case "up":
          setIsSuggestionHighlighted(false);
          setIsTopButtonHighlighted(true);
          break;
        case "down":
          setIsSuggestionHighlighted(false);
          break;
        case "left":
          setHighlightedSuggestionIndex((prev) => {
            let newIdx =
              (prev - 1 + suggestionsArray.length) % suggestionsArray.length;
            return newIdx;
          });
          break;
        case "right":
          setHighlightedSuggestionIndex((prev) => {
            let newIdx = (prev + 1) % suggestionsArray.length;
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
      if (actionType === "up") {
        // Move back to the keyboard grid
        setIsBottomButtonHighlighted(false);
      } else if (
        actionType === "left" ||
        actionType === "right"
      ) {
        // Toggle between bottom buttons
        setBottomHighlightedButton(bottomHighlightedButton === 0 ? 1 : 0);
      } else if (actionType === "action") {
        // Perform bottom button action
        handleBottomButtonAction();
      }
      return;
    }

    const isLastRow =
      Math.floor(selectedKey / numCols) ===
      Math.floor((keyboard.length - 1) / numCols);

    const isFirstRow = Math.floor(selectedKey / numCols) === 0;

    if (actionType === "up" && isFirstRow) {
      setIsSuggestionHighlighted(true);
    } else if (actionType === "down" && isLastRow) {
      setIsBottomButtonHighlighted(true);
    } else {
      const nextKey = handleInput({
        currHighlithedNav,
        array: keyboard,
        index: selectedKey,
        numCols,
        onAction: () => handleKeyPress(keyboard[selectedKey]),
      });
      setSelectedKey(nextKey);
    }
  }

  const handleTap = () => {
    handleWord(currHighlithedNav);
  };

  useEffect(() => {
    if(!isWordBuilderPage) return;
    if(!isConnected){
      console.error("Word Builder Page: Not connected, ignoring last action.");
      return;
    }
    handleWord(lastAction);
  }, [lastAction]);

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
              {halfWord}
            </Text>
          </View>
          <View className="flex flex-row items-center p-1 gap-1">
            <View>
              <Pressable
                onPress={() => setHalfWord("")}
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
                  speakText(halfWord);
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
            data={suggestionsArray}
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
                <Text style={styles.suggestionText}>{item}</Text>
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
          onPress={() => setHalfWord((prev) => prev + " ")}
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
          onPress={() => setHalfWord((prev) => prev.slice(0, -1))}
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
