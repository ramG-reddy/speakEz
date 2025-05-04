import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PRESETS } from "@/lib/constants/Data";
import { router } from "expo-router";
import {
  ONBOARDING_COMPLETE_KEY,
  PATIENT_INFO_KEY,
  PHRASES_KEY,
} from "@/lib/Config";

// Define the types for our patient data
export interface PatientInfo {
  name: string;
  age: string;
  region: string;
}

// Define the context type
interface OnboardingContextType {
  isOnboardingComplete: boolean;
  patientInfo: PatientInfo | null;
  phrases: string[];
  setPatientInfo: (info: PatientInfo) => Promise<void>;
  setPhrases: (phrases: string[]) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  checkOnboardingStatus: () => Promise<boolean>;
  loading: boolean;
}

// Create the context
const OnboardingContext = createContext<OnboardingContextType>({
  isOnboardingComplete: false,
  patientInfo: null,
  phrases: [],
  setPatientInfo: async () => {},
  setPhrases: async () => {},
  completeOnboarding: async () => {},
  checkOnboardingStatus: async () => false,
  loading: true,
});

// Create the provider component
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [patientInfo, setPatientInfoState] = useState<PatientInfo | null>(null);
  const [phrases, setPhrasesState] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Check if onboarding is complete on mount
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Function to check if onboarding is complete
  const checkOnboardingStatus = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const onboardingComplete = await AsyncStorage.getItem(
        ONBOARDING_COMPLETE_KEY
      );

      if (onboardingComplete === "true") {
        // If onboarding is complete, also load the saved data
        const storedPatientInfo = await AsyncStorage.getItem(PATIENT_INFO_KEY);
        const storedPhrases = await AsyncStorage.getItem(PHRASES_KEY);

        if (storedPatientInfo) {
          setPatientInfoState(JSON.parse(storedPatientInfo));
        }

        if (storedPhrases) {
          setPhrasesState(JSON.parse(storedPhrases));
        } else {
          // If no phrases are stored, use the default presets
          setPhrasesState(PRESETS);
        }

        setIsOnboardingComplete(true);
        return true;
      } else {
        setIsOnboardingComplete(false);
        return false;
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to set patient info
  const setPatientInfo = async (info: PatientInfo): Promise<void> => {
    try {
      await AsyncStorage.setItem(PATIENT_INFO_KEY, JSON.stringify(info));
      setPatientInfoState(info);
    } catch (error) {
      console.error("Error saving patient info:", error);
    }
  };

  // Function to set phrases
  const setPhrases = async (
    newPhrases: string[]
  ): Promise<void> => {
    try {
      await AsyncStorage.setItem(PHRASES_KEY, JSON.stringify(newPhrases));
      setPhrasesState(newPhrases);
    } catch (error) {
      console.error("Error saving phrases:", error);
    }
  };

  // Function to mark onboarding as complete
  const completeOnboarding = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
      setIsOnboardingComplete(true);
      router.replace("/(navPanel)/presets");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingComplete,
        patientInfo,
        phrases,
        setPatientInfo,
        setPhrases,
        completeOnboarding,
        checkOnboardingStatus,
        loading,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

// Create a hook to use the onboarding context
export const useOnboarding = () => useContext(OnboardingContext);
