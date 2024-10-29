import { account, config, databases } from "@/lib/appwrite";
import { ReactNode, useEffect, useState } from "react";

import { DataContext } from "./DataContext";
import {
  getDefaultRemoteData,
  getRemoteDataWithSetter,
  setRemoteDataLoading,
} from "@/utils/common";
import { Query } from "appwrite";
import { useUser } from "../user/UserContext";
import { RemoteData, Safari } from "@/type";

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [safaris, setSafaris] = useState<RemoteData<Safari[]>>(
    getDefaultRemoteData([])
  );
  const { currentUser } = useUser();

  useEffect(() => {
    (async () => {
      if (currentUser) {
        setRemoteDataLoading(setSafaris, true);

        const ownSafaris = (
          await databases.listDocuments(
            config.dbId,
            config.safariCollectionId,
            [Query.equal("userId", currentUser.$id)]
          )
        ).documents as Safari[];

        setSafaris((prev) => ({
          ...prev,
          data: ownSafaris,
        }));
      }
    })();
  }, [currentUser]);
  return (
    <DataContext.Provider
      value={{
        safaris: getRemoteDataWithSetter<Safari[]>(safaris, setSafaris),
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
