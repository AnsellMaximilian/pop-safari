import { account, config, databases } from "@/lib/appwrite";
import { ReactNode, useEffect, useState } from "react";

import { DataContext } from "./DataContext";
import {
  getDefaultRemoteData,
  getRemoteDataWithSetter,
  setRemoteDataLoading,
} from "@/utils/common";
import { Query } from "appwrite";

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <DataContext.Provider value={{}}>{children}</DataContext.Provider>;
};
