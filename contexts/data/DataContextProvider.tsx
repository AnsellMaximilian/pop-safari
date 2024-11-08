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
import { RemoteData, Safari, SafariVisibility } from "@/type";

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [safaris, setSafaris] = useState<RemoteData<Safari[]>>(
    getDefaultRemoteData([])
  );

  const [friendSafaris, setFriendSafaris] = useState<RemoteData<Safari[]>>(
    getDefaultRemoteData([])
  );

  const [publicSafaris, setPublicSafaris] = useState<RemoteData<Safari[]>>(
    getDefaultRemoteData([])
  );
  const { currentUser } = useUser();

  useEffect(() => {
    (async () => {
      if (currentUser?.profile) {
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

        setRemoteDataLoading(setSafaris, false);
      }
    })();
  }, [currentUser]);

  useEffect(() => {
    (async () => {
      if (currentUser?.profile) {
        setRemoteDataLoading(setFriendSafaris, true);
        setRemoteDataLoading(setPublicSafaris, true);

        const friendSafarisPromise =
          currentUser.profile.friendIds.length > 0
            ? databases
                .listDocuments(config.dbId, config.safariCollectionId, [
                  Query.equal("userId", currentUser.profile.friendIds),
                ])
                .then((res) => res.documents as Safari[])
            : Promise.resolve([]);

        const publicSafarisPromise = databases
          .listDocuments(config.dbId, config.safariCollectionId, [
            Query.and([
              Query.equal("visibility", SafariVisibility.PUBLIC),
              Query.notEqual("userId", currentUser.$id),
            ]),
          ])
          .then((res) => res.documents as Safari[]);

        const [friendSafaris, publicSafaris] = await Promise.all([
          friendSafarisPromise,
          publicSafarisPromise,
        ]);

        setFriendSafaris((prev) => ({
          ...prev,
          data: friendSafaris,
        }));

        setPublicSafaris((prev) => ({
          ...prev,
          data: publicSafaris,
        }));
        setRemoteDataLoading(setFriendSafaris, false);
        setRemoteDataLoading(setPublicSafaris, false);
      }
    })();
  }, [currentUser]);
  return (
    <DataContext.Provider
      value={{
        safaris: getRemoteDataWithSetter<Safari[]>(safaris, setSafaris),
        friendSafaris: getRemoteDataWithSetter<Safari[]>(
          friendSafaris,
          setSafaris
        ),
        publicSafaris: getRemoteDataWithSetter<Safari[]>(
          publicSafaris,
          setSafaris
        ),
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
