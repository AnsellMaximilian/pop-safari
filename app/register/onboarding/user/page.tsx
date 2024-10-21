"use client";

import { useUser } from "@/contexts/user/UserContext";
import { useRouter } from "next/navigation";
import { z } from "zod";

import React, { useEffect, useRef, useState } from "react";
import Map3D from "@/components/Map3D";
import { Map3dEvent } from "@/type/maps";
const formSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string(),
});
export default function UserOnboarding() {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const { currentUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (currentUser?.profile) router.push("/maps");
  }, [currentUser]);

  useEffect(() => {
    const handleMapClick: EventListenerOrEventListenerObject = (basicE) => {
      const e: Map3dEvent = basicE as Map3dEvent;
      console.log(e.position);
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
      <Map3D mapRef={mapRef} setMap={setMap} className="h-96 w-96" />
    </div>
  );
}
