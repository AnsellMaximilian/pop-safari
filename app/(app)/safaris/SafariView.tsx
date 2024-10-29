"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Safari, SafariStatus } from "@/type";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import React, { useContext } from "react";
import { SafariPageContext, SafariPageMode } from "./page";
import SafariStatusBadge from "./SafariStatusBadge";

export default function SafariView({ safari }: { safari: Safari }) {
  const { setPageMode, setSelectedSafari } = useContext(SafariPageContext);
  return (
    <>
      <div className="absolute top-4 left-4 z-10 bg-white rounded-md shadow-md p-4">
        <div className="flex gap-4 items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setPageMode(SafariPageMode.VIEW);
              setSelectedSafari(null);
            }}
          >
            <ChevronLeftIcon />
          </Button>
          <div>
            <h2 className="font-bold text-xs">Safari Mode</h2>
            <div className="flex gap-2">
              <h1>{safari.title}</h1>
              <SafariStatusBadge safari={safari} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
