"use client";

import { useUser } from "@/contexts/user/UserContext";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/type";
import { config, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import Image from "next/image";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { Label } from "@/components/ui/label";
import FriendCard from "./FriendCard";

export default function UserFriends() {
  const { currentUser } = useUser();
  const [friendProfiles, setFriendProfiles] = useState<UserProfile[]>([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  const [searchedProfiles, setSearchedProfiles] = useState<UserProfile[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const [usernameSearch, setUsernameSearch] = useState("");
  const [debouncedSearchTerm] = useDebounce(usernameSearch, 500);
  useEffect(() => {
    (async () => {
      if (currentUser?.profile && currentUser.profile.friendIds.length > 0) {
        const friends = (
          await databases.listDocuments(
            config.dbId,
            config.userProfileCollectionId,
            [Query.equal("$id", currentUser.profile.friendIds), Query.limit(50)]
          )
        ).documents as UserProfile[];

        setFriendProfiles(friends);
      } else {
        setFriendProfiles([]);
      }
    })();
  }, [currentUser?.profile]);
  useEffect(() => {
    if (debouncedSearchTerm) {
      (async () => {
        setIsSearchLoading(true);
        const profiles = (
          await databases.listDocuments(
            config.dbId,
            config.userProfileCollectionId,
            [Query.search("username", debouncedSearchTerm), Query.limit(50)]
          )
        ).documents as UserProfile[];

        setSearchedProfiles(profiles);
        setIsSearchLoading(false);
      })();
    } else setSearchedProfiles([]);
  }, [debouncedSearchTerm]);

  return (
    <div className="flex flex-col gap-4 grow">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <h1 className="font-bold text-xl">Friends</h1>
          <div>{currentUser?.profile?.friendIds.length}</div>
        </div>
      </div>
      <Tabs
        defaultValue="list"
        className="w-full mt-4 grow flex flex-col"
        onValueChange={() => setUsernameSearch("")}
      >
        <TabsList className="w-full">
          <TabsTrigger className="grow" value="list">
            List
          </TabsTrigger>
          <TabsTrigger className="grow" value="search">
            Search
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4 grow ">
          {friendProfiles.length > 0 ? (
            <div className="flex flex-col gap-2">
              {friendProfiles.map((p) => (
                <FriendCard
                  friend={p}
                  key={p.$id}
                  added={currentUser?.profile?.friendIds.some(
                    (f) => f === p.$id
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col grow items-center justify-center">
              <Image
                src="/friends-default.svg"
                width={200}
                height={200}
                className="w-44"
                alt="friends"
              />
              <div className="mt-8 px-8 text-center">
                Share your Safaris with friends. Start by searching their
                username and adding them.
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="search" className="space-y-4 grow ">
          <div className="h-full flex flex-col grow">
            <div className="mb-4">
              <Label className="text-xs">Search by Username</Label>
              <Input
                placeholder="Search by username"
                value={usernameSearch}
                onChange={(e) => setUsernameSearch(e.target.value)}
              />
            </div>
            {isSearchLoading ? (
              <div className="grow flex flex-col items-center justify-center">
                <Loader className="animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col grow">
                {searchedProfiles.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {searchedProfiles.map((p) => (
                      <FriendCard
                        friend={p}
                        key={p.$id}
                        added={currentUser?.profile?.friendIds.some(
                          (f) => f === p.$id
                        )}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col grow items-center justify-center">
                    <Image
                      src="/friends-default.svg"
                      width={200}
                      height={200}
                      className="w-44"
                      alt="friends"
                    />
                    <div className="mt-8 px-8 text-center">
                      User(s) not found
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
