"use client";

import Image from "next/image";
import React from "react";
import logo from "@/assets/pop-safari-logo.svg";
import UserMenu from "@/components/UserMenu";
import { AppMenuType } from "./page";
import { useAppData } from "./useAppData";
export const NavItem = ({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) => {
  return (
    <li>
      <button onClick={onClick}>{label}</button>
    </li>
  );
};
export default function Header() {
  const { setSelectedMenu } = useAppData();
  return (
    <header className="absolute right-4 top-4 z-10 bg-white p-4 rounded-md shadow-md">
      <nav className="flex gap-8 items-center">
        <Image
          src={logo}
          width={300}
          height={200}
          alt="logo"
          className="w-24"
        />
        <ul className="flex items-center gap-4 text-sm">
          <NavItem
            label="Safaris"
            onClick={() => setSelectedMenu(AppMenuType.SAFARIS)}
          />
          <NavItem
            label="Profile"
            onClick={() => setSelectedMenu(AppMenuType.PROFILE)}
          />
        </ul>
        <div className="ml-auto">
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
