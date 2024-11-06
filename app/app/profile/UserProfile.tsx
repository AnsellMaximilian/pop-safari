"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import defUser from "@/assets/default-user.svg";
import { useUser } from "@/contexts/user/UserContext";
import { config, databases, storage } from "@/lib/appwrite";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { UserProfile as IUserProfile } from "@/type";
import { ID } from "appwrite";

export default function UserProfile() {
  const { currentUser, setCurrentUser } = useUser();

  const { toast } = useToast();

  const [hasProfileChanged, setHasProfileChanged] = useState(false);

  const [newBioValue, setNewBioValue] = useState("");
  const [isBioInEditMode, setIsBioInEditMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreviewURL, setProfilePicturePreviewURL] = useState<
    string | null
  >(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const handleProfileChange: React.ChangeEventHandler<
    HTMLInputElement
  > = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes

    if (file) {
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "Image Error",
          description: "Currently, the image should not be bigger than 10mb",
        });
        return;
      }
      setProfilePicture(file);
      setHasProfileChanged(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreviewURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!currentUser?.profile) return;
      setIsUpdating(true);
      if (currentUser.profile.profileImageId) {
        await storage.deleteFile(
          config.bucketId,
          currentUser.profile.profileImageId
        );
      }
      let profileImageId: null | string = null;
      if (profilePicture) {
        const picture = await storage.createFile(
          config.bucketId,
          ID.unique(),
          profilePicture
        );

        profileImageId = picture.$id;
      }

      const updatedProfile = (await databases.updateDocument(
        config.dbId,
        config.userProfileCollectionId,
        currentUser.$id,
        { bio: newBioValue, profileImageId }
      )) as IUserProfile;

      setCurrentUser((prev) =>
        prev ? { ...prev, profile: updatedProfile } : null
      );
    } catch (error) {
      toast({
        title: "Error updating profile",
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsUpdating(false);
      reset();
    }
  };

  useEffect(() => {
    if (currentUser?.profile?.bio) {
      setNewBioValue(currentUser.profile.bio);
    }
  }, [currentUser?.profile]);

  const reset = () => {
    setProfilePicture(null);
    setProfilePicturePreviewURL(null);
    setIsBioInEditMode(false);

    if (currentUser?.profile?.bio) {
      setNewBioValue(currentUser.profile.bio);
    } else {
      setNewBioValue("");
    }
    setHasProfileChanged(false);
  };

  return (
    <div className="flex flex-col gap-4 grow">
      <h1 className="font-bold text-xl">Your Profile</h1>
      <div className="flex gap-4">
        <Input
          type="file"
          className="hidden"
          accept="image/jpeg, image/png, image/gif"
          onChange={handleProfileChange}
          ref={fileInputRef}
        />
        <img
          onClick={() => fileInputRef?.current?.click()}
          src={
            profilePicturePreviewURL
              ? profilePicturePreviewURL
              : currentUser?.profile?.profileImageId
              ? storage.getFileView(
                  config.bucketId,
                  currentUser.profile.profileImageId
                )
              : defUser
          }
          width={200}
          height={200}
          className="w-44 h-44 object-cover border-border border"
          alt="user profile"
        />
        <div className="space-y-4">
          <div>
            <div className="text-lg font-bold">{currentUser?.name}</div>
            <div className="text-sm text-muted-foreground">
              @{currentUser?.profile?.username}
            </div>
          </div>
          <div className="text-sm">
            <div className="text-xs font-bold">Email</div>
            <div>{currentUser?.email}</div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end">
          <div className="text-xs font-bold">Bio</div>
          {!isBioInEditMode && (
            <Pencil
              className="w-3 h-3"
              onClick={() => setIsBioInEditMode(true)}
            />
          )}
        </div>
        {isBioInEditMode ? (
          <Textarea
            className="text-sm mt-2"
            value={newBioValue}
            onChange={(e) => setNewBioValue(e.target.value)}
          />
        ) : (
          <div className="text-sm">
            {currentUser?.profile?.bio
              ? currentUser.profile.bio
              : "You have not set up a bio."}
          </div>
        )}
      </div>

      {(hasProfileChanged || newBioValue !== currentUser?.profile?.bio) && (
        <div className="flex justify-end gap-4 mt-auto mb-24">
          <Button variant="outline" onClick={reset} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUpdating}>
            Update
          </Button>
        </div>
      )}
    </div>
  );
}
