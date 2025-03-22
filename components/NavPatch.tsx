import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { ORDER_OF_HIGHLIGHTS, CHANGE_DELAY_ms } from "@/constants/Config";
import { useAppContext } from "@/context/AppContext";

export default function NavigationControl() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dirs = ORDER_OF_HIGHLIGHTS;

  const { currHighlithedNav, setCurrHighlightedNav } = useAppContext();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % dirs.length;
        setCurrHighlightedNav(dirs[newIndex]);
        return newIndex;
      });
    }, CHANGE_DELAY_ms);

    return () => clearInterval(interval);
  }, []);

  const buttonClass =
    "w-16 h-16 max-md:w-12 max-md:h-12 flex items-center justify-center border border-gray-300 rounded-md";
  const highlightedClass = "bg-green-200 border-black";
  const buttonTextClass = "text-2xl text-black";

  return (
    <View className="w-auto max-w-xs md:max-w-sm lg:max-w-md h-auto p-4 border border-gray-300 rounded-lg bg-gray-100 flex flex-col items-center justify-center">
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
