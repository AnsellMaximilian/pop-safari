import { PlaceData } from "@/type/maps";
import React from "react";

export default function PlaceDisplay({ place }: { place: PlaceData }) {
  return (
    <div>
      <div className="text-sm tracking-tight font-semibold">
        {place.displayName?.text}
      </div>
      <div className="text-xs">{place.formattedAddress}</div>
      {place.photos && place.photos.length > 0 && (
        <img
          src={`https://places.googleapis.com/v1/${
            place.photos[0].name
          }/media?key=${String(
            process.env.NEXT_PUBLIC_MAPS_API_KEY
          )}&maxHeightPx=${1000}&maxWidthPx=${1000}`}
          className="w-96"
        />
      )}
    </div>
  );
}
