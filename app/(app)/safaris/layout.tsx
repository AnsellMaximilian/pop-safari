"use client";

import { UserContextProvider } from "@/contexts/user/UserContextProvider";
import privateRoute from "@/hooks/privateRoute";

import React from "react";

function SafariLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

export default privateRoute(SafariLayout);
