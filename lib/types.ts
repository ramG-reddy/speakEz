export type NavAction = "up" | "down" | "left" | "right" | "action" | "none";

export type LLMAPIRequest = {
  sentence: string;
  numTokens: number;
  type: string;
}