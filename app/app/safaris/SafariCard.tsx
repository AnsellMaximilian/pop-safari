"use client";

import { Safari } from "@/type";
import React, { useContext } from "react";
import { SafariPageContext, SafariPageMode } from "./SafarisSection";
import { truncateString } from "@/utils/common";
import SafariStatusBadge from "./SafariStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SafariCard({
  safari,
  loading,
}: {
  safari: Safari;
  loading?: boolean;
}) {
  const { setPageMode, setSelectedSafari } = useContext(SafariPageContext);

  return loading ? (
    <Skeleton className="h-32 rounded-md" />
  ) : (
    <div
      onClick={() => {
        setSelectedSafari(safari);
        setPageMode(SafariPageMode.DETAILS);
      }}
      key={safari.$id}
      className="p-4 min-h-32 border-border border rounded-md shadow-sm cursor-pointer hover:bg-secondary hover:text-secondary-foreground"
    >
      <div className="flex justify-between items-center gap-2">
        <h2 className="font-semibold">{truncateString(safari.title, 15)}</h2>
        <SafariStatusBadge safari={safari} />
      </div>
      <p className="font-extralight">
        {safari.description
          ? truncateString(safari.description, 25)
          : "No description."}
      </p>
    </div>
  );
}