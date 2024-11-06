import { Badge } from "@/components/ui/badge";
import { Safari, SafariStatus } from "@/type";
import React from "react";

export default function SafariStatusBadge({ safari }: { safari: Safari }) {
  return (
    <Badge
      variant={safari.status === SafariStatus.DRAFT ? "outline" : "default"}
    >
      {safari.status === SafariStatus.DRAFT ? "Draft" : "Done"}
    </Badge>
  );
}
