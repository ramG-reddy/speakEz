import { View, Text, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import { ORDER_OF_HIGHLIGHTS, CHANGE_DELAY_ms } from "@/lib/constants/Config";
import { useAppContext } from "@/lib/context/AppContext";

export default function NavigationControl() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dirs = ORDER_OF_HIGHLIGHTS;
  const { width } = Dimensions.get("window");
  const isSmallDevice = width < 768;

  const { currHighlithedNav, setCurrHighlightedNav } = useAppContext();

  // First effect: Update local state
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % dirs.length);
    }, CHANGE_DELAY_ms);

    return () => clearInterval(interval);
  }, [dirs.length]);

  // Second effect: Update context state based on local state changes
  useEffect(() => {
    setCurrHighlightedNav(dirs[currentIndex]);
  }, [currentIndex, setCurrHighlightedNav, dirs]);

  // Adjust sizes based on screen width
  const buttonSize = isSmallDevice
    ? "w-6 h-6"
    : "w-12 h-12 max-md:w-10 max-md:h-10";
  const textSize = isSmallDevice ? "text-md" : "text-2xl";

  const buttonClass = `${buttonSize} flex items-center justify-center border border-gray-300 rounded-md`;
  const highlightedClass = "bg-green-200 border-black";
  const buttonTextClass = `${textSize} text-black`;

  return (
    <View className="w-auto p-2 md:p-4 border border-gray-300 rounded-lg bg-gray-100 flex flex-col items-center justify-center">
      <View className="flex flex-row gap-1 m-1">
        <View
          className={`${buttonClass} ${
            currHighlithedNav === "up" ? highlightedClass : "bg-white"
          }`}
        >
          <Text className={buttonTextClass}>↑</Text>
        </View>
      </View>
      <View className="flex flex-row gap-1">
        <View
          className={`${buttonClass} ${
            currHighlithedNav === "left" ? highlightedClass : "bg-white"
          }`}
        >
          <Text className={buttonTextClass}>←</Text>
        </View>
        <View
          className={`${buttonClass} ${
            currHighlithedNav === "action" ? highlightedClass : "bg-white"
          }`}
        >
          <Text className={buttonTextClass}>OK</Text>
        </View>
        <View
          className={`${buttonClass} ${
            currHighlithedNav === "right" ? highlightedClass : "bg-white"
          }`}
        >
          <Text className={buttonTextClass}>→</Text>
        </View>
      </View>
      <View className="flex flex-row gap-1 m-1">
        <View
          className={`${buttonClass} ${
            currHighlithedNav === "down" ? highlightedClass : "bg-white"
          }`}
        >
          <Text className={buttonTextClass}>↓</Text>
        </View>
      </View>
    </View>
  );
}
