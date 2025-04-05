import { createContext, useContext, useState } from "react";
import { NavAction } from "@/lib/types";

const AppContext = createContext({
  currHighlithedNav: "right" as NavAction,
  setCurrHighlightedNav: (highlight: NavAction) => {},
  textAreaValue: "",
  setTextAreaValue: (sentance: string) => {},
});

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currHighlithedNav, setCurrHighlightedNav] = useState<NavAction>("right");
  const [textAreaValue, setTextAreaValue] = useState<string>("");

  return (
    <AppContext.Provider value={{ currHighlithedNav, setCurrHighlightedNav, textAreaValue, setTextAreaValue }}>
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  return useContext(AppContext);
}
