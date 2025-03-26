import { createContext, useContext, useState } from "react";

const AppContext = createContext({
  currHighlithedNav: "right",
  setCurrHighlightedNav: (highlight: string) => {},
});

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currHighlithedNav, setCurrHighlightedNav] = useState("right");

  return (
    <AppContext.Provider value={{ currHighlithedNav, setCurrHighlightedNav }}>
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  return useContext(AppContext);
}
