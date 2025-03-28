import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type NotificationType = "error" | "success" | "info";

type NotificationBannerProps = {
  message: string;
  type?: NotificationType;
  visible: boolean;
  duration?: number;
  onDismiss: () => void;
};

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  type = "info",
  visible,
  duration = 3000,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = React.useRef(new Animated.Value(-200)).current;
  const { width } = Dimensions.get("window");

  // Handle appearance/disappearance animations
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();

      // Auto dismiss after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, duration]);

  // Handle manual dismissal
  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -200,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  // Get colors based on notification type
  const getBackgroundColor = () => {
    switch (type) {
      case "error":
        return "#f44336";
      case "success":
        return "#4caf50";
      case "info":
      default:
        return "#2196f3";
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: getBackgroundColor(),
          paddingTop: insets.top > 0 ? insets.top : 10,
          width: width,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  message: {
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    marginLeft: 16,
    padding: 4,
  },
  closeButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});
