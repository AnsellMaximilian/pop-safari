import { useContext } from "react";
import { AppPageContext, AppPageContextData } from "./page";

export const useAppData = (): AppPageContextData => {
  const context = useContext(AppPageContext);
  if (!context) {
    throw new Error("useAppData must be used within a provider");
  }
  return context;
};
