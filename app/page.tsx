"use client";

import Map3D from "@/components/Map3D";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/pop-safari-logo.svg";
import Image from "next/image";
import { getElevation, loader } from "@/lib/maps";
import { ROUTE_MARKER } from "@/const/maps";
import { MarkerUtils } from "@/utils/maps";
import { useRouter } from "next/navigation";

export default function Home() {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (map) {
      loader.load().then(async () => {
        // @ts-ignore
        const { Model3DElement } = await google.maps.importLibrary("maps3d");

        const model = new Model3DElement({
          src: "/logo-v2.glb",
          position: {
            lat: 27.985406733231923,
            lng: 86.92516831888577,
            altitude: 7893.81103515625,
          },
          scale: 300,
          altitudeMode: "ABSOLUTE" as google.maps.maps3d.AltitudeMode.ABSOLUTE,
          orientation: { tilt: 270, roll: 180 },
        });

        map.append(model);

        const markerWithCustomSvg = await MarkerUtils.createImageMarker(
          27.975498748734523,
          86.93044049406387,
          "/play-marker.svg",
          ROUTE_MARKER,
          true,
          (e) => {
            router.push("/app");
          },
          300
        );

        map.append(markerWithCustomSvg);
      });
    }
  }, [map]);
  return (
    <Map3D
      mapRef={mapRef}
      setMap={setMap}
      className="fixed inset-0"
      options={{
        center: {
          lat: 27.989023561084355,
          lng: 87.15689047466542,
          altitude: 4317.825535016791,
        },
        tilt: 79.62952734836283,
        range: 28303.85835754685,
        heading: 86.06221146169686,
        defaultLabelsDisabled: true,
      }}
    ></Map3D>
  );
}
