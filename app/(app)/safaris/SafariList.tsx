"use client";

import { useData } from "@/contexts/data/DataContext";
import React, { useContext, useEffect, useState } from "react";
import { SafariPageContext, SafariPageMode } from "./page";
import { Button } from "@/components/ui/button";
import { truncateString } from "@/utils/common";
import SafariStatusBadge from "./SafariStatusBadge";

export default function SafariList() {
  const { safaris } = useData();

  const { setPageMode, setSelectedSafari } = useContext(SafariPageContext);

  return (
    <div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase">Your Safaris</h2>
          <Button
            onClick={() => {
              setSelectedSafari(null);
              setPageMode(SafariPageMode.CREATE);
            }}
          >
            Create Safari
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {safaris.data.map((s) => (
            <div
              onClick={() => {
                setSelectedSafari(s);
                setPageMode(SafariPageMode.DETAILS);
              }}
              key={s.$id}
              className="p-4 min-h-32 border-border border rounded-md shadow-sm cursor-pointer hover:bg-secondary hover:text-secondary-foreground"
            >
              <div className="flex justify-between items-center gap-2">
                <h2 className="font-semibold">{truncateString(s.title, 15)}</h2>
                <SafariStatusBadge safari={s} />
              </div>
              <p className="font-extralight">
                {s.description
                  ? truncateString(s.description, 25)
                  : "No description."}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
