"use client";

import { useData } from "@/contexts/data/DataContext";
import React from "react";
import SafariCard from "./SafariCard";

export default function OtherSafarisList() {
  const { publicSafaris, friendSafaris } = useData();
  return (
    <>
      <div className="space-y-4">
        <div className="">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase">
              Friends&apos; Safaris
            </h2>
          </div>
          {!friendSafaris.isLoading && friendSafaris.data.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {friendSafaris.data.map((s) => (
                <SafariCard
                  safari={s}
                  key={s.$id}
                  loading={friendSafaris.isLoading}
                />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-center">
              Your friends&apos; Safaris will show up here if they&apos;ve set
              it in Friends mode.
            </div>
          )}
        </div>

        <div className="">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase">Public Safaris</h2>
          </div>
          {!publicSafaris.isLoading && publicSafaris.data.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {publicSafaris.data.map((s) => (
                <SafariCard
                  safari={s}
                  key={s.$id}
                  loading={publicSafaris.isLoading}
                />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-center">
              People&apos;s Safaris which have been set as public will show up
              here
            </div>
          )}
        </div>
      </div>
    </>
  );
}
