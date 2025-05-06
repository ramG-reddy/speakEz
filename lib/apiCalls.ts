import AsyncStorage from "@react-native-async-storage/async-storage";
import { APIRequest } from "./types";
import { API_URL, PHRASES_KEY } from "./Config";
import axios from "axios";


export const getSugestions = async ({
  sentence,
  numTokens,
  type,
  flag,
}: APIRequest) => {
  const storedPhrases = await AsyncStorage.getItem(PHRASES_KEY);
  const phrases = storedPhrases ? JSON.parse(storedPhrases) : [];
  if (flag === "1") return [];
  const response = await axios.post(
    `${API_URL}/generate`,
    {
      sentence,
      numTokens,
      phrases,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = response.data;
  return data.suggestions;
};

export const postSubmitBatch = async (phrases: string[], flag: string) => {
  const storedPhrases = await AsyncStorage.getItem(PHRASES_KEY);
  const existingPhrases = storedPhrases ? JSON.parse(storedPhrases) : [];

  const newPhrases = [...existingPhrases, ...phrases];
  if (flag === "1") return false;
  await AsyncStorage.setItem(PHRASES_KEY, JSON.stringify(newPhrases));

  const response = await axios.post(
    `${API_URL}/submit`,
    {
      phrases: newPhrases,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const data = response.data;
  return data.success;
};

export const retrainModel = async (flag: string) => {
  if (flag === "1") return false;

  const response = await axios.post(
    `${API_URL}/retrain`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const data = response.data;
  return data.success;
};
