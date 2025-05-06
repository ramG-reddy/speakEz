export type NavAction = "up" | "down" | "left" | "right" | "action" | "none";

export type APIRequest = {
  sentence: string;
  numTokens: number;
  type: string;
  flag ?: string;
};
