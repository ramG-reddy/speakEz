import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavAction } from "@/lib/types";
import { CHANGE_DELAY_KEY, CHANGE_DELAY_ms } from "@/lib/Config";

const AppContext = createContext({
  currHighlithedNav: "right" as NavAction,
  setCurrHighlightedNav: (highlight: NavAction) => {},
  textAreaValue: "",
  setTextAreaValue: (sentence: string) => {},
  changeDelay: CHANGE_DELAY_ms,
  setChangeDelay: async (delay: number) => {},
});

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currHighlithedNav, setCurrHighlightedNav] =
    useState<NavAction>("right");
  const [textAreaValue, setTextAreaValue] = useState<string>("");
  const [changeDelay, setChangeDelayState] = useState<number>(CHANGE_DELAY_ms);

  useEffect(() => {
    const loadChangeDelay = async () => {
      const storedDelay = await AsyncStorage.getItem(CHANGE_DELAY_KEY);
      if (storedDelay) {
        setChangeDelayState(Number(storedDelay));
      }
    };
    loadChangeDelay();
  }, []);

  const setChangeDelay = async (delay: number) => {
    setChangeDelayState(delay);
    await AsyncStorage.setItem(CHANGE_DELAY_KEY, String(delay));
  };

  return (
    <AppContext.Provider
      value={{
        currHighlithedNav,
        setCurrHighlightedNav,
        textAreaValue,
        setTextAreaValue,
        changeDelay,
        setChangeDelay,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  return useContext(AppContext);
}
