import PlaceDisplay from "@/components/PlaceDisplay";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { nearbyItemLabels, nearbyItemLogo } from "@/const/maps";
import { getPlaceDetails } from "@/lib/maps";
import { NearbyItemInfo, SafariPolygon, SafariSpot } from "@/type";
import { PlaceData } from "@/type/maps";
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
      console.log(spot);
      if (spot && spot.placeId) {
        const placeDetails = await getPlaceDetails(spot.placeId);

        setPlace(placeDetails);
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
