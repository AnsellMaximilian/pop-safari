import { createContext, Dispatch, SetStateAction, useContext } from "react";
export interface DataContextData {}

export const DataContext = createContext<DataContextData>({});

export const useData = (): DataContextData => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error(
      "useData must be used within a corresponding ContextProvider"
    );
  }
  return context;
};
