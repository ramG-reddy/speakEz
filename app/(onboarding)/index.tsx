import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");
  const isSmallDevice = width < 768;
  const isTablet = width >= 768 && width < 1024;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingLeft: insets.left + 20,
            paddingRight: insets.right + 20,
            paddingBottom: insets.bottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              isSmallDevice && styles.smallTitle,
              isTablet && styles.tabletTitle,
            ]}
          >
            Welcome to SpeakEz
          </Text>
          <Text
            style={[styles.subtitle, isSmallDevice && styles.smallSubtitle]}
          >
            A Communication Assistant for Neurological Patients. Please Scroll down
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/splash-icon.png")}
            style={[styles.image, isSmallDevice && styles.smallImage]}
            resizeMode="contain"
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.description, isSmallDevice && styles.smallText]}>
            We'll guide you through a quick setup to personalize the experience
            for the patient.
          </Text>

          <Text style={[styles.steps, isSmallDevice && styles.smallText]}>
            • Enter patient information{"\n"}• Add frequent phrases{"\n"}• Ready
            to go!
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, isSmallDevice && styles.smallButton]}
            onPress={() => router.push("/(onboarding)/patient-info")}
          >
            <Text
              style={[
                styles.buttonText,
                isSmallDevice && styles.smallButtonText,
              ]}
            >
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  smallTitle: {
    fontSize: 24,
  },
  tabletTitle: {
    fontSize: 28,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  smallSubtitle: {
    fontSize: 14,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
  },
  image: {
    width: 220,
    height: 220,
  },
  smallImage: {
    width: 160,
    height: 160,
  },
  contentContainer: {
    marginBottom: 40,
  },
  description: {
    fontSize: 18,
    color: "#444",
    lineHeight: 28,
    marginBottom: 20,
    textAlign: "center",
  },
  steps: {
    fontSize: 18,
    color: "#444",
    lineHeight: 32,
    paddingLeft: 20,
  },
  smallText: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4287f5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  smallButton: {
    paddingVertical: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  smallButtonText: {
    fontSize: 16,
  },
});
