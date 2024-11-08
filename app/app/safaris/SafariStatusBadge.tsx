import { Badge } from "@/components/ui/badge";
import { Safari, SafariStatus, SafariVisibility } from "@/type";
import React from "react";

export default function SafariStatusBadge({ safari }: { safari: Safari }) {
  return (
    <Badge variant={"outline"}>
      {safari.visibility === SafariVisibility.PUBLIC
        ? "Public"
        : safari.visibility === SafariVisibility.FRIENDS
        ? "Friends"
        : "Private"}
    </Badge>
  );
}
