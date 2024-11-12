import { PlaceData } from "@/type/maps";
import React from "react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import Rating from "./Rating";
import {
  formatOpeningHours,
  formatToTitleCase,
  truncateString,
} from "@/utils/common";
import Link from "next/link";

export default function PlaceDisplay({ place }: { place: PlaceData }) {
  console.log({ place });
  return (
    <div>
      <div className="flex gap-4">
        <div className="grow">
          <div className="flex justify-between items-end gap-4">
            <div className="text-sm tracking-tight font-semibold">
              {truncateString(place.displayName?.text || "No name", 30)}
            </div>
            <div className="flex justify-end mt-2">
              <Badge
                className={cn(
                  place.currentOpeningHours?.openNow ? "bg-green-400" : ""
                )}
                variant={
                  place.currentOpeningHours?.openNow ? "default" : "destructive"
                }
              >
                {place.currentOpeningHours?.openNow ? "Open" : "Closed"}
              </Badge>
            </div>
          </div>

          <div className="text-xs">{place.formattedAddress}</div>

          {place.rating && (
            <div className="mt-2">
              <Rating rating={place.rating} showPoints />
            </div>
          )}

          {place.websiteUri && (
            <div className="mt-4 text-sm">
              <Link
                className="text-xs underline hover:text-primary"
                href={place.websiteUri}
              >
                {place.websiteUri}
              </Link>
            </div>
          )}
        </div>
        {place.photos && place.photos.length > 0 && (
          <img
            src={`https://places.googleapis.com/v1/${
              place.photos[0].name
            }/media?key=${String(
              process.env.NEXT_PUBLIC_MAPS_API_KEY
            )}&maxHeightPx=${1000}&maxWidthPx=${1000}`}
            className="w-32 h-32 object-cover"
          />
        )}
      </div>
      <div className="mt-4 space-y-4">
        {place.types && (
          <div className="flex flex-wrap gap-2">
            {place.types.map((t) => (
              <div
                key={t}
                className="text-xs border-border border p-1 bg-muted text-muted-foreground rounded-md"
              >
                {formatToTitleCase(t)}
              </div>
            ))}
          </div>
        )}

        {place.currentOpeningHours?.weekdayDescriptions && (
          <div>
            <div className="text-sm font-bold mb-2">Opening Hours</div>
            <div className="text-sm space-y-2">
              {place.currentOpeningHours.weekdayDescriptions
                .map(formatOpeningHours)
                .map((p, i) => (
                  <div
                    key={p.period + i}
                    className="flex justify-between items-center border-border border rounded-md"
                  >
                    <div className="font-bold p-1">{p.day}</div>
                    <div className="py-1 px-4 bg-muted w-2/5 text-right">
                      {p.period}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
