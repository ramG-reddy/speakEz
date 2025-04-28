import { Platform } from "react-native";
import Tts from "react-native-tts"; // Import TTS for native platforms

export const speakText = (sentence: string) => {
  if (Platform.OS === "web") {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Add a slight pause at the beginning to improve initial pronunciation
    const processedText = sentence.trim();
    const utterance = new SpeechSynthesisUtterance(processedText);

    // Configure speech parameters for better pronunciation
    utterance.rate = 0.9; // Slightly slower rate for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Set language if needed
    // utterance.lang = 'en-US';

    // Add a small delay before speaking to ensure engine is ready
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 500);
  } else {
    // Native platform implementation
    Tts.setDefaultRate(0.4);
    Tts.setDefaultPitch(1.0);
    Tts.setDucking(true); // Enable ducking to lower volume of other sounds
    Tts.setDefaultVoice("en-US"); // Set default voice to US English
    Tts.setIgnoreSilentSwitch("ignore"); // Ignore silent switch for iOS
    Tts.speak(sentence.trim());
  }
};
