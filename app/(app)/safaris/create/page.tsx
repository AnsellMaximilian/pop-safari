"use client";

import Map3D from "@/components/Map3D";
import { Input } from "@/components/ui/input";
import { initAutocomplete, loader } from "@/lib/maps";
import { Map3dEvent, MapResponse, PlaceData } from "@/type/maps";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { CURRENT_USER_POS } from "@/const/maps";
import PlaceDisplay from "@/components/PlaceDisplay";

export default function Create() {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const [displayedPlace, setDisplayedPlace] = useState<PlaceData | null>(null);

  useEffect(() => {
    let autocompleteListener: google.maps.MapsEventListener | null = null;

    if (map)
      initAutocomplete(map, async (place) => {
        try {
          const placeDetails = (await axios.get(
            `https://places.googleapis.com/v1/places/${
              place.place_id
            }?fields=id,displayName,photos,currentOpeningHours,currentSecondaryOpeningHours,internationalPhoneNumber,nationalPhoneNumber,priceLevel,rating,regularOpeningHours,regularSecondaryOpeningHours,userRatingCount,websiteUri,formattedAddress,location,types,viewport&key=${String(
              process.env.NEXT_PUBLIC_MAPS_API_KEY
            )}`
          )) as { data: PlaceData };

          setDisplayedPlace(placeDetails.data);
        } catch (error) {
          console.log(error);
        }
      }).then((listener) => {
        autocompleteListener = listener;
      });

    return () => {
      if (autocompleteListener) {
        google.maps.event.removeListener(autocompleteListener);
      }
    };
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

  useEffect(() => {
    if (map) {
      loader.load().then(async () => {
        // @ts-ignore
        const { Marker3DElement } = (await google.maps.importLibrary(
          "maps3d"
        )) as google.maps.Maps3DLibrary;
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              alt: 100,
            };
            console.log({ userLocation, position });
            // @ts-ignore
            map.flyCameraTo({
              endCamera: {
                center: {
                  lat: userLocation.lat,
                  lng: userLocation.lng,
                  altitude: userLocation.alt,
                },
                tilt: 67.5,
                range: 500,
              },
              durationMillis: 5000,
            });

            const marker = new Marker3DElement({
              position: { lat: userLocation.lat, lng: userLocation.lng },
              label: "Current Position",
            });

            if (map) {
              const oldMarkers = document.querySelectorAll(
                `.${CURRENT_USER_POS}`
              );

              oldMarkers.forEach((m) => m.remove());
              marker.classList.add(CURRENT_USER_POS);
              map.append(marker);
            }
          },
          (error) => {
            console.error("Error fetching location:", error);
          }
        );
      });
    }
  }, [map]);

  return (
    <div>
      <div className="flex gap-8">
        <div className="">
          <Input
            placeholder="Search"
            className="rounded-none max-w-[400px]"
            id="pac-input"
          />
          <Map3D
            mapRef={mapRef}
            setMap={setMap}
            className="h-96 w-[400px] relative"
          ></Map3D>
        </div>
        <div>
          <h1>Places</h1>
          <Input placeholder="Search Place" />
          {displayedPlace && <PlaceDisplay place={displayedPlace} />}
        </div>
      </div>
    </div>
  );
}
