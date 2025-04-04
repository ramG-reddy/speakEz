import { createContext, useContext, useState } from "react";
import { NavAction } from "@/lib/types";

const AppContext = createContext({
  currHighlithedNav: "right" as NavAction,
  setCurrHighlightedNav: (highlight: NavAction) => {},
});

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currHighlithedNav, setCurrHighlightedNav] = useState<NavAction>("right");

  return (
    <AppContext.Provider value={{ currHighlithedNav, setCurrHighlightedNav }}>
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  return useContext(AppContext);
}
