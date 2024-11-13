import PlaceDisplay from "@/components/PlaceDisplay";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { nearbyItemLabels, nearbyItemLogo } from "@/const/maps";
import { getPlaceDetails } from "@/lib/maps";
import { NearbyItemInfo, SafariPolygon, SafariSpot } from "@/type";
import { PlaceData } from "@/type/maps";
import { format } from "date-fns";
import { Info, X } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function SelectedItem({
  onClose,
  label,
  polygon,
  spot,
}: {
  onClose?: () => void;
  label: string;
  spot: SafariSpot | null;
  polygon: SafariPolygon | null;
}) {
  const [place, setPlace] = useState<PlaceData | null>(null);

  useEffect(() => {
    (async () => {
      if (spot && spot.placeId) {
        const placeDetails = await getPlaceDetails(spot.placeId);

        setPlace(placeDetails);
      } else {
        setPlace(null);
      }
    })();
  }, [spot]);
  if (!polygon && !spot) {
    if (onClose) onClose();
    return null;
  }

  const title = polygon ? polygon.title : spot!.name;
  const description = polygon ? polygon.description : spot?.description;
  return (
    <div className=" bg-white rounded-lg w-[500px] grow overflow-y-auto">
      <header className="p-4 flex items-center gap-4">
        <Info />
        <span className="font-bold text-lg">{label}</span>

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
      <div className="p-4 space-y-4">
        <div className="">
          <h2 className="text-lg font-bold">{title}</h2>
          <p>{description || "No description available"}</p>
        </div>
        {spot && (
          <div className="flex items-center gap-4">
            <div className="grow border-border border rounded-md p-2">
              <div className="text-xs font-bold">Start Time</div>
              <div className="text-sm">
                {spot.startTime
                  ? format(new Date(spot.startTime), "MMMM do 'at' h:mm a")
                  : "Not Set"}
              </div>
            </div>
            <div className="grow border-border border rounded-md p-2">
              <div className="text-xs font-bold">EndTime</div>
              <div className="text-sm">
                {spot.endTime
                  ? format(new Date(spot.endTime), "MMMM do 'at' h:mm a")
                  : "Not Set"}
              </div>
            </div>
          </div>
        )}
        {place && (
          <>
            <Separator />
            <div className="">
              <h3 className="font-semibold">Associated Place</h3>
              <PlaceDisplay place={place} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
