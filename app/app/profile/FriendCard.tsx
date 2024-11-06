"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user/UserContext";
import { config, databases } from "@/lib/appwrite";
import { UserProfile } from "@/type";
import { UserRoundPlus } from "lucide-react";
import React, { useState } from "react";

export default function FriendCard({
  friend,
  added = false,
  onAdd,
}: {
  friend: UserProfile;
  added?: boolean;
  onAdd?: () => void;
}) {
  const { currentUser, setCurrentUser } = useUser();
  const [isAdding, setIsAdding] = useState(false);
  return (
    <div className="p-4 rounded-md border border-border flex items-center justify-between">
      <div>
        <div className="text-sm font-bold">{friend.name}</div>
        <div className="text-xs text-muted-foreground">@{friend.username}</div>
      </div>
      <div>
        {added ? (
          <Button variant="outline" disabled>
            Added
          </Button>
        ) : (
          <Button
            disabled={isAdding}
            size="icon"
            onClick={async () => {
              if (currentUser?.profile) {
                try {
                  setIsAdding(true);
                  const updatedUserProfile = (await databases.updateDocument(
                    config.dbId,
                    config.userProfileCollectionId,
                    currentUser.$id,
                    {
                      friendIds: [...currentUser.profile.friendIds, friend.$id],
                    }
                  )) as UserProfile;

                  setCurrentUser((prev) =>
                    prev ? { ...prev, profile: updatedUserProfile } : null
                  );
                } catch (error) {
                } finally {
                  setIsAdding(false);
                }
              }
            }}
          >
            <UserRoundPlus />
          </Button>
        )}
      </div>
    </div>
  );
}
