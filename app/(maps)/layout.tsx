"use client";

import { Button } from "@/components/ui/button";
import { polygonOptions } from "@/const/maps";
import { loader } from "@/lib/maps";
import { Coordinate, Map3dEvent } from "@/type/maps";
import React, { useEffect, useRef, useState } from "react";

export default function MapsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<Coordinate[]>([]);

  const mapRef = useRef<HTMLDivElement>(null);

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
          map.addEventListener("gmp-click", (basicE) => {
            const e: Map3dEvent = basicE as Map3dEvent;

            setSelectedCoords((prev) => [
              ...prev,
              {
                lat: e.position.lat,
                lng: e.position.lng,
                altitude: e.position.altitude,
              },
            ]);
          });
        }
      });
    }
    return () => {
      if (mapRef.current && map) mapRef.current.removeChild(map);
    };
  }, []);
  return (
    <div>
      <div ref={mapRef} className="h-96"></div>
      {children}
      <button
        onClick={() => {
          if (map) {
            // @ts-ignore
            map.flyCameraTo({
              endCamera: {
                center: {
                  lat: 37.6191,
                  lng: Math.random() * 120,
                  altitude: 1000,
                },
                tilt: 67.5,
                range: 1000,
              },
              durationMillis: 5000,
            });
          }
        }}
      >
        Move Camera
      </button>
      {selectedCoords.map((c, i) => {
        return (
          <div key={i}>
            lat: {c.lat} lng: {c.lng} alt: {c.altitude}
          </div>
        );
      })}
      <Button
        onClick={() => {
          if (map) {
            const polygon = new google.maps.maps3d.Polygon3DElement(
              polygonOptions
            );
            polygon.outerCoordinates = selectedCoords.map((c) => ({
              ...c,
              altitude: 300,
            }));

            map.append(polygon);
            setSelectedCoords([]);
          }
        }}
      >
        Create Polygon
      </Button>
      <Button
        onClick={() => {
          setSelectedCoords([]);
        }}
      >
        Remove Points
      </Button>
    </div>
  );
}
