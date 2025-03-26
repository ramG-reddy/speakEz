import { useEffect, useState } from "react";
import { useBLE } from "@/lib/context/BLEContext";
import { handleInput } from "@/lib/utils/handleInput";
import { Platform } from "react-native";

type UseBLEInputProps = {
  array: any[];
  index: number;
  numCols: number;
  onAction: () => void;
  isEnabled?: boolean;
};

export const useBLEInput = ({
  array,
  index,
  numCols,
  onAction,
  isEnabled = true,
}: UseBLEInputProps) => {
  const [currentIndex, setCurrentIndex] = useState(index);
  const { lastAction } = useBLE();

  useEffect(() => {
    // Skip for web platform or if disabled
    if (Platform.OS === "web" || !isEnabled) return;

    // Only process if we have a valid action
    if (lastAction !== "none") {
      const nextIndex = handleInput({
        currHighlithedNav: lastAction,
        array,
        index: currentIndex,
        numCols,
        onAction,
      });

      setCurrentIndex(nextIndex);
    }
  }, [lastAction, array, currentIndex, numCols, onAction, isEnabled]);

  return { currentIndex };
};
