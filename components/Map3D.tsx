"use client";

import React, { HTMLAttributes, useEffect } from "react";
import { loader } from "@/lib/maps";

interface Props extends HTMLAttributes<HTMLDivElement> {
  setMap?: React.Dispatch<
    React.SetStateAction<google.maps.maps3d.Map3DElement | null>
  >;
  mapRef: React.RefObject<HTMLDivElement>;
  options?: google.maps.maps3d.Map3DElementOptions;
  disableLabels?: boolean;
}
export default function Map3D({
  mapRef,
  setMap,
  options,
  disableLabels = false,
  ...props
}: Props) {
  useEffect(() => {
    let map: google.maps.maps3d.Map3DElement;
    if (mapRef.current != null) {
      loader.load().then(async () => {
        const { Map3DElement } = (await google.maps.importLibrary(
          "maps3d"
        )) as google.maps.Maps3DLibrary;
        map = new Map3DElement(
          options
            ? options
            : {
                center: {
                  lat: 40.6904220416242,
                  lng: -74.0464663795214,
                  altitude: 5.817827242160252,
                },
                tilt: 75.08332032319454,
                range: 334.6798065248004,
                heading: -44.04146077322564,
                defaultLabelsDisabled: disableLabels,
              }
        );

        if (map) {
          if (setMap) setMap(map);
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
