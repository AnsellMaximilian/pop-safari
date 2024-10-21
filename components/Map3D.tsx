"use client";

import React, { HTMLAttributes, useEffect } from "react";
import { loader } from "@/lib/maps";

interface Props extends HTMLAttributes<HTMLDivElement> {
  setMap: React.Dispatch<
    React.SetStateAction<google.maps.maps3d.Map3DElement | null>
  >;
  mapRef: React.RefObject<HTMLDivElement>;
}
export default function Map3D({ mapRef, setMap, ...props }: Props) {
  useEffect(() => {
    let map: google.maps.maps3d.Map3DElement;
    if (mapRef.current != null) {
      loader.load().then(async () => {
        const { Map3DElement } = (await google.maps.importLibrary(
          "maps3d"
        )) as google.maps.Maps3DLibrary;
        map = new Map3DElement({
          center: { lat: 37.36353, lng: -121.9286, altitude: 0 },
          tilt: 67.5,
          range: 1000,
        });

        if (map) {
          setMap(map);
          mapRef.current!.append(map);
        }
      });
    }
    return () => {
      if (mapRef.current && map) mapRef.current.removeChild(map);
    };
  }, []);
  return <div ref={mapRef} {...props}></div>;
}
