"use client";

import Map3D from "@/components/Map3D";
import { Button } from "@/components/ui/button";
import {
  BUSINESS_REGIS_POLYGON,
  BUSINESS_REGISTRATION_MARKER,
  polygonOptions,
} from "@/const/maps";
import { useUser } from "@/contexts/user/UserContext";
import privateRoute from "@/hooks/privateRoute";
import { config, storage } from "@/lib/appwrite";
import { loader } from "@/lib/maps";
import { removeElementsWithClass } from "@/utils/maps";
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
    loader.load().then(async () => {
      if (currentUser?.business && map) {
        // @ts-ignore
        const { Marker3DElement } = (await google.maps.importLibrary(
          "maps3d"
        )) as google.maps.Maps3DLibrary;
        // marker and fly camera
        if (
          currentUser.business.positionLat &&
          currentUser.business.positionLng
        ) {
          // @ts-ignore
          map.flyCameraTo({
            endCamera: {
              center: {
                lat: currentUser.business.positionLat,
                lng: currentUser.business.positionLng,
                altitude: 100,
              },
              tilt: 67.5,
              range: 1000,
            },
            durationMillis: 5000,
          });

          removeElementsWithClass(BUSINESS_REGISTRATION_MARKER);

          const marker = new Marker3DElement({
            position: {
              lat: currentUser.business.positionLat,
              lng: currentUser.business.positionLng,
            },
            label: currentUser.business.name,
          });

          marker.classList.add(BUSINESS_REGISTRATION_MARKER);
          map.append(marker);
        }

        // polygon
        if (currentUser.business.polygonPositions.length > 2) {
          try {
            const positions = currentUser.business.polygonPositions.map((p) =>
              JSON.parse(p)
            );

            removeElementsWithClass(BUSINESS_REGIS_POLYGON);

            const polygon = new google.maps.maps3d.Polygon3DElement(
              polygonOptions
            );
            polygon.outerCoordinates = positions.map((c) => ({
              ...c,
              altitude: 300,
            }));
            polygon.classList.add(BUSINESS_REGIS_POLYGON);
            map.append(polygon);
          } catch (error) {}
        }
      }
    });
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
