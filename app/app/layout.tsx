"use client";

import Link from "next/link";

import { UserContextProvider } from "@/contexts/user/UserContextProvider";
import { DataContextProvider } from "@/contexts/data/DataContextProvider";

function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserContextProvider>
      <DataContextProvider>{children}</DataContextProvider>
    </UserContextProvider>
  );
}

export default AppLayout;
