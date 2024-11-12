"use client";

import { Safari } from "@/type";
import React, { useContext } from "react";
import { SafariPageContext, SafariPageMode } from "./SafarisSection";
import { truncateString } from "@/utils/common";
import SafariStatusBadge from "./SafariStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useUser } from "@/contexts/user/UserContext";

export default function SafariCard({
  safari,
  loading,
  handleDelete,
}: {
  safari: Safari;
  loading?: boolean;
  handleDelete?: () => Promise<void> | void;
}) {
  const { setPageMode, setSelectedSafari } = useContext(SafariPageContext);
  const { currentUser } = useUser();

  return loading ? (
    <Skeleton className="h-36 rounded-md" />
  ) : (
    <div
      onClick={() => {
        setSelectedSafari(safari);
        setPageMode(SafariPageMode.DETAILS);
      }}
      key={safari.$id}
      className="p-4 min-h-36 border-border border rounded-md shadow-sm cursor-pointer hover:bg-secondary hover:text-secondary-foreground flex flex-col"
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
      {currentUser?.$id === safari.userId && (
        <div className="ml-auto flex justify-end mt-auto">
          <Button
            variant="destructive"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (handleDelete) handleDelete();
            }}
          >
            <Trash />
          </Button>
        </div>
      )}
    </div>
  );
}
