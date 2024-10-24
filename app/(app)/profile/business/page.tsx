"use client";

import Map3D from "@/components/Map3D";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user/UserContext";
import privateRoute from "@/hooks/privateRoute";
import { config, storage } from "@/lib/appwrite";
import { loader } from "@/lib/maps";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

function BusinessProfilePage() {
  const { currentUser, isLoading, isLoadingBusiness } = useUser();

  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMapClick: EventListenerOrEventListenerObject = (basicE) => {
      loader.load().then(async () => {});
    };
    if (map) {
      map.addEventListener("gmp-click", handleMapClick);
    }

    return () => {
      map?.removeEventListener("gmp-click", handleMapClick);
    };
  }, [map]);

  // once user's business loads, fly camera
  useEffect(() => {
    if (currentUser?.business && map) {
      // @ts-ignore
      map.flyCameraTo({
        endCamera: {
          center: { lat: 40.6191, lng: -122.3816, altitude: 100 },
          tilt: 67.5,
          range: 1000,
        },
        durationMillis: 5000,
      });
    }
  }, [currentUser?.business, map]);

  const router = useRouter();

  if (isLoadingBusiness) return <div>Loading...</div>;

  return (
    <div>
      {currentUser?.business ? (
        <div>
          <h1>{currentUser.business.name}</h1>
          <p>{currentUser.business.description}</p>
          {currentUser.business.profileImageId && (
            <img
              loading="lazy"
              width={300}
              height={300}
              src={storage.getFileView(
                config.bucketId,
                currentUser.business.profileImageId
              )}
              alt="business photo"
            />
          )}
          <Map3D
            mapRef={mapRef}
            setMap={setMap}
            className="h-96 w-[500px] relative"
          />
        </div>
      ) : (
        <div>Register a business first.</div>
      )}
    </div>
  );
}

export default privateRoute(BusinessProfilePage);
