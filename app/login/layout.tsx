"use client";

import { UserContextProvider } from "@/contexts/user/UserContextProvider";

import React from "react";

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <UserContextProvider>{children}</UserContextProvider>;
}
