import { User } from "@/type";
import { createContext, Dispatch, SetStateAction, useContext } from "react";
export interface UserContextData {
  currentUser: User | null;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  // for fetching account
  isLoading: boolean;
  // for activities involving accounts (register, login, etc)
  isProcessing: boolean;

  isLoadingBusiness: boolean;
  isLoadingProfile: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  getAccount: () => Promise<void>;
}

export const UserContext = createContext<UserContextData>({
  currentUser: null,
  setCurrentUser: () => {},
  isLoading: true,
  isProcessing: false,
  isLoadingBusiness: false,
  isLoadingProfile: false,
  login: () => {},
  logout: () => {},
  getAccount: async () => {},
});

export const useUser = (): UserContextData => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error(
      "useUser must be used within a corresponding ContextProvider"
    );
  }
  return context;
};
