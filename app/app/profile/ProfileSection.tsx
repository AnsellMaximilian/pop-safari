"use client";

import { getVariants } from "@/components/CollapsibleController";
import logo from "@/assets/pop-safari-logo.svg";
import Map3D from "@/components/Map3D";
import { useUser } from "@/contexts/user/UserContext";
import { cn } from "@/lib/utils";
import { FlyCameraOptions } from "@/type/maps";
import { AnimatePresence, motion } from "framer-motion";
import React, {
  createContext,
  Dispatch,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import defUser from "@/assets/default-user.svg";
import Image from "next/image";
import UserProfile from "./UserProfile";
import UserFriends from "./UserFriends";
import { AppMenuType, AppPageContext } from "../page";
import { useAppData } from "../useAppData";
import Header from "../Header";

function ProfileMenu({
  label,
  value,
  onClick,
  selected,
}: {
  value: string;
  label: string;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-sm p-2 rounded-md hover:opacity-90 bg-white w-24 border border-border transition-all duration-200",
        selected ? "bg-primary border-white text-primary-foreground" : ""
      )}
    >
      {label}
    </button>
  );
}

export default function ProfileSection() {
  const { setSelectedMenu, selectedMenu, map } = useAppData();

  return (
    <>
      <div className="absolute top-4 left-4 right-4 h-12 z-10 flex gap-4 items-center">
        <ProfileMenu
          value={AppMenuType.PROFILE}
          selected={selectedMenu === AppMenuType.PROFILE}
          label="Profile"
          onClick={() => setSelectedMenu(AppMenuType.PROFILE)}
        />
        <ProfileMenu
          value={AppMenuType.FRIENDS}
          selected={selectedMenu === AppMenuType.FRIENDS}
          label="Friends"
          onClick={() => setSelectedMenu(AppMenuType.FRIENDS)}
        />
        <ProfileMenu
          value={AppMenuType.EXTRAS}
          selected={selectedMenu === AppMenuType.EXTRAS}
          label="Extras"
          onClick={() => setSelectedMenu(AppMenuType.EXTRAS)}
        />
      </div>

      <AnimatePresence>
        {selectedMenu === AppMenuType.PROFILE && (
          <motion.div
            initial={getVariants().initial}
            animate={getVariants().animate}
            exit={getVariants().exit}
            transition={{ duration: 0.25 }}
            className="absolute z-10 left-4 top-[5rem] bottom-4 overflow-y-auto rounded-md bg-white p-4 shadow-md w-[500px] flex flex-col"
          >
            <UserProfile />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMenu === AppMenuType.FRIENDS && (
          <motion.div
            initial={getVariants().initial}
            animate={getVariants().animate}
            exit={getVariants().exit}
            transition={{ duration: 0.25 }}
            className="absolute z-10 left-4 top-[5rem] bottom-4 overflow-y-auto rounded-md bg-white p-4 shadow-md w-[500px] flex flex-col"
          >
            <UserFriends />
          </motion.div>
        )}
      </AnimatePresence>

      <Header />
    </>
  );
}
