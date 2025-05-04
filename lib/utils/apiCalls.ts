import axios from 'axios';
import { LLMAPIRequest } from '@/lib/types';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PHRASES_KEY } from '@/lib/Config';

const GEMINI_API_KEY = "AIzaSyC4Gp0T5U6b5gKm_zQledyVw26eUzLvOnw";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

export const getSuggestions = async ({sentence, numTokens, type}: LLMAPIRequest) => {
  if(!GEMINI_API_KEY || !GEMINI_API_URL) {
    throw new Error('GEMINI_API_KEY or GEMINI_API_URL is not defined');
  }

  if(sentence.length < 1) {
    sentence = "Please";
  }

  let prompt;

  switch (type) {
    case "word-builder":
      prompt = `Only return a list of ${numTokens} full single words that could be the last word of the sentence which currently has only a substring of the last word. Here is the sentence: '${sentence}' Answer specifically for the context of a disabled person. Format: '<<word1::word2::word3::word4::word5>>' nothing else.`;
      break;
    case "sentence-builder":
      prompt = `Only return a list of ${numTokens} single words that would come next in the sentence. Here is the sentence: '${sentence}' Answer specifically for the context of a disabled person. Format: '<<word1::word2::word3::word4::word5>>' nothing else.`;
      break;
    default:
      break;
  }

  const storedPhrases = await AsyncStorage.getItem(PHRASES_KEY);
  const phrases = storedPhrases ? JSON.parse(storedPhrases) : [];

  const phrasesString = phrases.map((phrase: { id: string, text: string }) => phrase.text).join("\n");

  prompt += `\n\nHere are some phrases that the patient has already selected:\n${phrasesString}\n\n`;

  // TODO: Use the age and regionality data

  const response = await axios.post(
    `${GEMINI_API_URL}${GEMINI_API_KEY}`,
    {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a helpful assistant. You are supposed to generate phrases that help disabled people communicate better. You will be given context when available, try to align yourself with the context and give the response in the specific format requested. Never respond with sentences!!! you only have to give words!!!`,
            }
          ]
        },
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = response.data;
  const suggestions = data?.candidates[0]?.content?.parts[0]?.text || null;

  if (!suggestions) {
    throw new Error('No suggestions found');
  }

  const formattedSuggestions = suggestions
    .replace(/<<|>>/g, '')
    .split('::')
    .map((word: string) => word.trim())
    .filter((word: string) => word.length > 0);

  console.log("Suggestions:", formattedSuggestions);

  return formattedSuggestions;
}
