import { RemoteDataWithSetter, Safari } from "@/type";
import { createContext, Dispatch, SetStateAction, useContext } from "react";
export interface DataContextData {
  safaris: RemoteDataWithSetter<Safari[]>;
  friendSafaris: RemoteDataWithSetter<Safari[]>;
  publicSafaris: RemoteDataWithSetter<Safari[]>;
}

export const DataContext = createContext<DataContextData | undefined>(
  undefined
);

export const useData = (): DataContextData => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error(
      "useData must be used within a corresponding ContextProvider"
    );
  }
  return context;
};
