import { RemoteDataWithSetter, Safari } from "@/type";
import { createContext, Dispatch, SetStateAction, useContext } from "react";
export interface DataContextData {
  safaris: RemoteDataWithSetter<Safari[]>;
}

export const DataContext = createContext<DataContextData>({
  safaris: {
    isLoading: false,
    data: [],
    setData: () => {},
  },
});

export const useData = (): DataContextData => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error(
      "useData must be used within a corresponding ContextProvider"
    );
  }
  return context;
};
