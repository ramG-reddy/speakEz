import { useRef, useState } from "react";
import { FlatList } from "react-native";

type UseGridScrollOptions = {
  numCols: number;
  isSmallDevice?: boolean;
};

export function useGridScroll({
  numCols,
  isSmallDevice = false,
}: UseGridScrollOptions) {
  const flatListRef = useRef<FlatList>(null);
  const [listReady, setListReady] = useState(false);
  const rowHeightRef = useRef(isSmallDevice ? 70 : 90);

  // Measure row height to improve scrolling accuracy
  const handleItemLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      rowHeightRef.current = height;
    }
  };

  // Safer scrolling using scrollToOffset instead of scrollToIndex
  const safeScrollToPosition = (
    index: number,
    arrayLength: number,
    skipScroll = false
  ) => {
    if (!flatListRef.current || !listReady || arrayLength === 0 || skipScroll)
      return;

    try {
      // Calculate which row this item is in
      const rowIndex = Math.floor(index / numCols);
      const offset = rowIndex * rowHeightRef.current;

      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({
            offset,
            animated: true,
          });
        }
      }, 50);
    } catch (error) {
      console.log("Scroll error:", error);
    }
  };

  // Props for FlatList component
  const getListProps = () => ({
    ref: flatListRef,
    onLayout: () => setListReady(true),
    removeClippedSubviews: false,
    contentContainerStyle: { paddingBottom: 20 },
  });

  return {
    flatListRef,
    handleItemLayout,
    safeScrollToPosition,
    setListReady,
    getListProps,
  };
}
