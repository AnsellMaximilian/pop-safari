"use client";

import React, { useContext, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import defUser from "@/assets/default-user.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/user/UserContext";
import Link from "next/link";
import { config, storage } from "@/lib/appwrite";
import { getInitials } from "@/utils/common";
import { SafariPageContext } from "@/app/app/safaris/SafarisSection";
import { useAppData } from "@/app/app/useAppData";
import { AppMenuType } from "@/app/app/page";
export default function UserMenu() {
  const { logout, currentUser } = useUser();
  const { setSelectedMenu } = useAppData();
  const [profilePictureURL, setProfilePictureURL] = useState<string | null>(
    null
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage
            src={
              currentUser?.profile?.profileImageId
                ? storage.getFileView(
                    config.bucketId,
                    currentUser.profile.profileImageId
                  )
                : defUser.src
            }
          />
          <AvatarFallback>{getInitials(currentUser?.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <button onClick={() => setSelectedMenu(AppMenuType.PROFILE)}>
            Profile
          </button>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
