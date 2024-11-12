import { PlaceData } from "@/type/maps";
import React from "react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import Rating from "./Rating";
import { truncateString } from "@/utils/common";

export default function PlaceDisplay({ place }: { place: PlaceData }) {
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
    </div>
  );
}
