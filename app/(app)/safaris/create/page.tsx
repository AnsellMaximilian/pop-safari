"use client";

import Map3D from "@/components/Map3D";
import { Input } from "@/components/ui/input";
import { initAutocomplete, loader } from "@/lib/maps";
import { Map3dEvent } from "@/type/maps";
import React, { useEffect, useRef, useState } from "react";

export default function Create() {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (map) initAutocomplete(map);
  }, [map]);

  useEffect(() => {
    const handleMapClick: EventListenerOrEventListenerObject = (basicE) => {
      loader.load().then(async () => {
        // @ts-ignore
        const { Marker3DElement } = (await google.maps.importLibrary(
          "maps3d"
        )) as google.maps.Maps3DLibrary;
        const e: Map3dEvent = basicE as Map3dEvent;
      });
    };
    if (map) {
      map.addEventListener("gmp-click", handleMapClick);
    }

    return () => {
      map?.removeEventListener("gmp-click", handleMapClick);
    };
  }, [map]);

  return (
    <div>
      <div className="flex gap-8">
        <div className="">
          <Input
            placeholder="Search"
            className="rounded-none max-w-[700px]"
            id="pac-input"
          />
          <Map3D
            mapRef={mapRef}
            setMap={setMap}
            className="h-96 w-[700px] relative"
          ></Map3D>
        </div>
        <div>
          <h1>Places</h1>
          <Input placeholder="Search Place" />
        </div>
      </div>
    </div>
  );
}
