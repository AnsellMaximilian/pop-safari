"use client";

import PlaceDisplay from "@/components/PlaceDisplay";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { nearbyItemLabels, nearbyItemLogo } from "@/const/maps";
import { getPlaceDetails } from "@/lib/maps";
import {
  NearbyItemInfo,
  NearbyItemType,
  SafariPolygon,
  SafariSpot,
} from "@/type";
import { PlaceData } from "@/type/maps";
import { format } from "date-fns";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function NearbyItem({
  item,
  onClose,
}: {
  item: NearbyItemInfo;
  onClose?: () => void;
}) {
  const Logo = nearbyItemLogo[item.type];

  const [place, setPlace] = useState<PlaceData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (item.spot?.placeId) {
          setPlace(await getPlaceDetails(item.spot.placeId));
        }
      } catch (error) {}
    })();
  }, [item.spot]);
  return (
    <div className=" bg-white rounded-lg min-w-[500px] grow overflow-y-auto">
      <header className="p-4 flex items-center gap-4">
        <Logo />
        <span className="font-bold text-lg">{nearbyItemLabels[item.type]}</span>

        <Button
          className="ml-auto"
          size="icon"
          variant="outline"
          onClick={() => {
            if (onClose) onClose();
          }}
        >
          <X />
        </Button>
      </header>
      <Separator />
      <div className="p-4">
        <h2 className="text-lg font-bold">{item.title}</h2>
        <p>{item.description || "No description available"}</p>
      </div>
      {item.spot && (
        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className="grow border-border border rounded-md p-2">
              <div className="text-xs font-bold">Start Time</div>
              <div className="text-sm">
                {item.spot.startTime
                  ? format(new Date(item.spot.startTime), "MMMM do 'at' h:mm a")
                  : "Not Set"}
              </div>
            </div>
            <div className="grow border-border border rounded-md p-2">
              <div className="text-xs font-bold">EndTime</div>
              <div className="text-sm">
                {item.spot.endTime
                  ? format(new Date(item.spot.endTime), "MMMM do 'at' h:mm a")
                  : "Not Set"}
              </div>
            </div>
          </div>
        </div>
      )}
      {place && item.type === NearbyItemType.SPOT && (
        <div className="p-4">
          <PlaceDisplay place={place} />
        </div>
      )}
    </div>
  );
}
