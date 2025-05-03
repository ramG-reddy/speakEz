import React from "react";
import {
  View,
  Text,
  Button,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { NavigationProps } from "../app/(home)/types";

const StepOne: React.FC<NavigationProps> = ({ onNext, onBack }) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 770;
  const styles = StyleSheet.create({
    button: {
      width: !isSmallScreen ? 168 : 64,
      height: !isSmallScreen ? 67 : 32,
      borderRadius: 64,
      paddingTop: 11,
      paddingBottom: 11,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#60A5FA", // Tailwind's blue-400
    },
    text: {
      color: "black",
      fontSize: !isSmallScreen ? 32 : 16,
      fontWeight: "bold",
    },
  });
  return (
    <View className="flex-col w-full h-full justify-between py-[40px]">
      <View>
        <Text className="mb-[20px] font-[20px] text-4xl text-center">
          Welcome to the Multi-Step Form!
        </Text>
      </View>
      <View className="flex flex-row justify-between gap-5 w-full px-[100px]">
        <Pressable onPress={onBack} style={styles.button}>
          <Text style={styles.text}>Back</Text>
        </Pressable>
        <Pressable onPress={onNext} style={styles.button}>
          <Text style={styles.text}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default StepOne;
