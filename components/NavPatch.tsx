import { View, Text, Dimensions, Image, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { ORDER_OF_HIGHLIGHTS, CHANGE_DELAY_ms } from "@/lib/Config";
import { useAppContext } from "@/lib/context/AppContext";

export default function NavigationControl() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dirs = ORDER_OF_HIGHLIGHTS;
  const { width } = Dimensions.get("window");
  const isSmallDevice = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const { currHighlithedNav, setCurrHighlightedNav, changeDelay } = useAppContext();

  // First effect: Update local state
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % dirs.length);
    }, changeDelay);

    return () => clearInterval(interval);
  }, [dirs.length]);

  // Second effect: Update context state based on local state changes
  useEffect(() => {
    setCurrHighlightedNav(dirs[currentIndex]);
  }, [currentIndex, setCurrHighlightedNav, dirs]);

  // Adjust sizes based on screen width
  const buttonSize = isTablet || isSmallDevice ? "w-12 h-12" : "w-16 h-16";
  const textSize = isSmallDevice || isTablet ? "text-xl" : "text-3xl";

  const buttonClass = `${buttonSize} flex items-center justify-center border border-gray-300 rounded-md`;
  const highlightedClass = "bg-[#ADFF5B] border-black";
  const buttonTextClass = `${textSize} text-black font-bold`;

  // Image size based on device size
  const imageSize = isSmallDevice ? 28 : 36;

  return (
    <View className="w-auto p-2 md:p-4 border border-gray-300 rounded-lg bg-[#72919E] flex flex-col items-center justify-center">
      <View className="flex flex-row gap-2 m-2">
        <Pressable
          onPress={() => setCurrHighlightedNav("up")}
          className={`${buttonClass} ${
            currHighlithedNav === "up" ? highlightedClass : "bg-white"
          }`}
        >
          <Image
            source={require("@/assets/images/arrow.png")}
            style={{ width: imageSize, height: imageSize }}
          />
        </Pressable>
      </View>
      <View className="flex flex-row gap-2">
        <Pressable
          onPress={() => setCurrHighlightedNav("left")}
          className={`${buttonClass} ${
            currHighlithedNav === "left" ? highlightedClass : "bg-white"
          }`}
        >
          <Image
            source={require("@/assets/images/arrow.png")}
            style={{
              width: imageSize,
              height: imageSize,
              transform: [{ rotate: "-90deg" }],
            }}
          />
        </Pressable>
        <Pressable
          onPress={() => setCurrHighlightedNav("action")}
          className={`${buttonClass} ${
            currHighlithedNav === "action" ? highlightedClass : "bg-white"
          }`}
        >
          <Text className={buttonTextClass}>OK</Text>
        </Pressable>
        <Pressable
          onPress={() => setCurrHighlightedNav("right")}
          className={`${buttonClass} ${
            currHighlithedNav === "right" ? highlightedClass : "bg-white"
          }`}
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
      <View className="flex flex-row gap-2 m-2">
        <Pressable
          onPress={() => setCurrHighlightedNav("down")}
          className={`${buttonClass} ${
            currHighlithedNav === "down" ? highlightedClass : "bg-white"
          }`}
        >
          <Image
            source={require("@/assets/images/arrow.png")}
            style={{
              width: imageSize,
              height: imageSize,
              transform: [{ rotate: "180deg" }],
            }}
          />
        </Pressable>
      </View>
    </View>
  );
}
