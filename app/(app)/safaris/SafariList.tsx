"use client";

import { useData } from "@/contexts/data/DataContext";
import { useUser } from "@/contexts/user/UserContext";
import { config, databases } from "@/lib/appwrite";
import { Safari } from "@/type";
import { Query } from "appwrite";
import React, { useEffect, useState } from "react";

export default function SafariList() {
  const { safaris } = useData();

  return (
    <div className="grid grid-cols-2 gap-4">
      {safaris.data.map((s) => (
        <div
          key={s.$id}
          className="p-4 border-border border rounded-md shadow-sm cursor-pointer hover:bg-secondary hover:text-secondary-foreground"
        >
          <h2 className="text-lg font-semibold">{s.title}</h2>
        </div>
      ))}
    </div>
  );
}
