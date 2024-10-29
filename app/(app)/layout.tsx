"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/pop-safari-logo.svg";
import UserMenu from "@/components/UserMenu";
import privateRoute from "@/hooks/privateRoute";
import { UserContextProvider } from "@/contexts/user/UserContextProvider";
import { DataContextProvider } from "@/contexts/data/DataContextProvider";
export const NavItem = ({ label, href }: { label: string; href: string }) => {
  return (
    <li>
      <Link href={href}>{label}</Link>
    </li>
  );
};
function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserContextProvider>
      <DataContextProvider>
        {/* <div className="h-screen flex flex-col">
        <header className="p-4 border-b border-border">
          <nav className="flex gap-8 items-center">
            <Image
              src={logo}
              width={300}
              height={200}
              alt="logo"
              className="w-24"
            />
            <ul className="flex items-center gap-4 text-sm">
              <NavItem label="Dashboard" href="/app/dashboard" />
              <NavItem label="Profile" href="/app/profile" />
            </ul>
            <div className="ml-auto">
              <UserMenu />
            </div>
          </nav>
        </header>
        <div className="container p-4 mx-auto grow flex flex-col">
          {children}
        </div>
      </div> */}
        {children}
      </DataContextProvider>
    </UserContextProvider>
  );
}

export default DashboardLayout;
