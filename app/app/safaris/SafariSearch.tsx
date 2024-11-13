"use client";

import CollapsibleController from "@/components/CollapsibleController";
import { Search } from "lucide-react";
import React, { useContext } from "react";
import { SafariPageContext, SafariViewMode } from "./SafarisSection";
import PlaceDisplay from "@/components/PlaceDisplay";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
export default function SafariSearch() {
  const {
    place,
    setSafariViewMode,
    setPlace,
    setExtraSpotData,
    setCurrentPoint,
  } = useContext(SafariPageContext);
  return (
    <>
      {place && (
        <CollapsibleController
          className="absolute right-4 top-44 bottom-4 z-10 items-start"
          OpenIcon={Search}
          contents={(setOpen) => (
            <div className="bg-white rounded-md shadow-md min-w-[500px] grow flex flex-col overflow-y-auto">
              <header className="p-4 flex items-center justify-between">
                <h2 className="text-sm font-bold">Nearby Place</h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setOpen(false)}
                >
                  <X />
                </Button>
              </header>
              <Separator />
              <div className="p-4">
                {" "}
                <PlaceDisplay place={place} />
              </div>
              <Separator />
              <div className="p-4 flex justify-end">
                <Button
                  onClick={() => {
                    if (place.location?.latitude && place.location.longitude) {
                      setSafariViewMode(SafariViewMode.ROUTE);
                      setCurrentPoint({
                        latitude: place.location.latitude,
                        longitude: place.location.longitude,
                      });
                      setTimeout(() => {
                        setPlace(place);
                        setExtraSpotData((prev) => ({
                          ...prev,
                          placeId: place.id,
                        }));
                      }, 1);
                    }
                  }}
                >
                  Create Route
                </Button>
              </div>
            </div>
          )}
        ></CollapsibleController>
      )}
    </>
  );
}
