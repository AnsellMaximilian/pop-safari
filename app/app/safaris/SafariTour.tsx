"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { SafariPageContext } from "./SafarisSection";

import { Eye, FastForward, Info, Pause, Play, Trash, X } from "lucide-react";
import CollapsibleController, {
  CollapsibleContext,
} from "@/components/CollapsibleController";
import { FlyCameraOptions, LatLng, LatLngAlt } from "@/type/maps";
import {
  createGroundCircle,
  findCenter,
  getAltitudesForPoints,
  getElevation,
  getElevationforPoint,
  updateGroundCircle,
} from "@/lib/maps";
import { config, databases, storage } from "@/lib/appwrite";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { MarkerUtils, removeElementsWithClass } from "@/utils/maps";
import { NEARBY_MARKER, nearbyItemMarkers, TOUR_MARKER } from "@/const/maps";
import { cn } from "@/lib/utils";
import { NearbyItemInfo, NearbyItemType } from "@/type";
import { v4 } from "uuid";
import NearbyItem from "./NearbyItem";

export default function SafariTour({
  map,
}: {
  map: google.maps.maps3d.Map3DElement;
}) {
  const {
    setPageMode,
    setSafariPolygons,
    setSafariSpots,
    setSafariViewMode,
    safariSpots,
    routeDecodedPath,
    safariPolygons,
    setRouteDecodedPath,
  } = useContext(SafariPageContext);
  const { setOpen } = useContext(CollapsibleContext);
  const { toast } = useToast();

  const [pointsWithAltitudes, setPointsWithAltitudes] = useState<LatLngAlt[]>(
    []
  );

  // animation
  const [currentAnimationId, setCurrentAnimationId] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [speedMultiplier, setspeedMultiplier] = useState(1);

  const [isReverse, setIsReverse] = useState(false);

  const [nearestItem, setNearestItem] = useState<NearbyItemInfo | null>(null);
  const [showNearbyItem, setShowNearbyItem] = useState(false);

  const updateNearestItem = async (center: LatLng) => {
    const maxDistance = 0.005;
    let closestItem: NearbyItemInfo | null = null;
    let closestDistance = Infinity;

    for (const spot of safariSpots) {
      const distance = Math.sqrt(
        Math.pow(center.latitude - spot.lat, 2) +
          Math.pow(center.longitude - spot.lng, 2)
      );
      if (distance < closestDistance && distance <= maxDistance) {
        closestItem = {
          id: v4(),
          type: NearbyItemType.SPOT,
          title: spot.name,
          description: spot.description || "No description",
          latLng: { latitude: spot.lat, longitude: spot.lng },
        } as NearbyItemInfo;
        closestDistance = distance;
      }
    }

    for (const polygon of safariPolygons) {
      const polygonPoints: LatLng[] = polygon.points.map((p) => JSON.parse(p));
      const polygonCenter = findCenter(polygonPoints);
      const distance = Math.sqrt(
        Math.pow(center.latitude - polygonCenter.latitude, 2) +
          Math.pow(center.longitude - polygonCenter.longitude, 2)
      );
      if (distance < closestDistance && distance <= maxDistance) {
        closestItem = {
          id: v4(),
          type: NearbyItemType.POLYGON,
          title: polygon.title,
          description: polygon.description || "No description",
          latLng: polygonCenter,
        };
        closestDistance = distance;
      }
    }

    if (closestItem !== nearestItem) {
      setNearestItem(closestItem);

      // Clear previous marker
      removeElementsWithClass(NEARBY_MARKER);

      // Add marker to the new nearest spot
      if (closestItem) {
        MarkerUtils.createImageMarker(
          closestItem.latLng.latitude,
          closestItem.latLng.longitude,
          nearbyItemMarkers[closestItem.type],
          NEARBY_MARKER,
          true
        ).then((marker) => map.append(marker));
      }
    }
  };

  useEffect(() => {
    (async () => {
      setPointsWithAltitudes(await getAltitudesForPoints(routeDecodedPath));
    })();
  }, [routeDecodedPath]);

  useEffect(() => {
    let animationFrameId: number;

    if (isPlaying && pointsWithAltitudes.length >= 2) {
      const durationPerStep = 500 / speedMultiplier;

      removeElementsWithClass(TOUR_MARKER);
      const initialCenter = {
        latitude: pointsWithAltitudes[0].latitude,
        longitude: pointsWithAltitudes[0].longitude,
        altitude: pointsWithAltitudes[0].altitude,
      };
      const groundCircle = createGroundCircle(map, initialCenter, 10);

      let currentStep = currentStepIndex;

      if (currentStep === pointsWithAltitudes.length) {
        currentStep = 0;
        setCurrentStepIndex(currentStep);
      }

      const flyToNextStep = () => {
        if (currentStep >= pointsWithAltitudes.length - 1) {
          setIsPlaying(false);
          return;
        }

        if (currentStep < 0) {
          setIsPlaying(false);
          setCurrentStepIndex(0);
          return;
        }

        const startCenter = map.center!;
        const targetCenter = pointsWithAltitudes[currentStep];
        const startTilt = map.tilt || 45;
        const targetTilt = 45;
        const startHeading = map.heading || 10;
        const targetHeading = startHeading + 10;
        const startRange = map.range || 500;
        const targetRange = 500;

        let startTime: number | null = null;

        function animateStep(time: number) {
          if (!startTime) startTime = time;
          const progress = (time - startTime) / durationPerStep;
          const easedProgress = Math.min(progress, 1);
          map.center = {
            lat:
              startCenter.lat +
              (targetCenter.latitude - startCenter.lat) * easedProgress,
            lng:
              startCenter.lng +
              (targetCenter.longitude - startCenter.lng) * easedProgress,
            altitude:
              startCenter.altitude +
              (targetCenter.altitude - startCenter.altitude) * easedProgress,
          };
          map.tilt = startTilt + (targetTilt - startTilt) * easedProgress;
          map.heading =
            startHeading + (targetHeading - startHeading) * easedProgress;
          map.range = startRange + (targetRange - startRange) * easedProgress;

          updateGroundCircle(
            groundCircle,
            {
              latitude: map.center.lat,
              longitude: map.center.lng,
            },
            10
          );

          updateNearestItem({
            latitude: map.center.lat,
            longitude: map.center.lng,
          });

          if (progress < 1) {
            animationFrameId = requestAnimationFrame(animateStep);
          } else {
            isReverse ? currentStep-- : currentStep++;
            setCurrentStepIndex(currentStep);
            flyToNextStep();
          }
        }

        requestAnimationFrame(animateStep);
      };

      flyToNextStep();
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, pointsWithAltitudes, speedMultiplier, isReverse]);

  return (
    <>
      <div className="bg-white p-1 rounded-full bottom-4 left-1/2 -translate-x-1/2 absolute z-10 px-4 flex justify-center gap-4 items-center">
        <button
          disabled={safariSpots.length < 2}
          onClick={() => {
            setIsPlaying(true);

            if (!isReverse) setspeedMultiplier(1);
            else {
              setspeedMultiplier((prev) => (prev + 0.5 > 2 ? 1 : prev + 0.5));
            }

            setIsReverse(true);
          }}
          className={cn(
            "flex items-center w-8 h-8 rounded-full justify-center gap-1",
            isReverse
              ? "bg-primary text-white"
              : "hover:bg-secondary hover:text-secondary-foreground"
          )}
        >
          {isReverse && (
            <span className="text-[.5rem] font-bold">x{speedMultiplier}</span>
          )}
          <FastForward size={12} className="rotate-180" />
        </button>
        <button
          disabled={safariSpots.length < 2}
          className={cn(
            "p-2 rounded-full",
            !isReverse && speedMultiplier <= 1
              ? "bg-primary text-white disabled:bg-muted disabled:text-muted-foreground"
              : "hover:bg-secondary disabled:bg-muted disabled:text-muted-foreground"
          )}
          onClick={() => {
            setIsPlaying((prev) => !prev);
            if (currentStepIndex === 0) setIsReverse(false);

            if (currentStepIndex >= pointsWithAltitudes.length - 1)
              setCurrentStepIndex(0);
          }}
        >
          {isPlaying ? <Pause /> : <Play />}
        </button>

        <button
          disabled={safariSpots.length < 2}
          onClick={() => {
            setIsPlaying(true);
            if (isReverse) setspeedMultiplier(1.5);
            else {
              setspeedMultiplier((prev) => (prev + 0.5 > 2 ? 1 : prev + 0.5));
            }
            setIsReverse(false);
          }}
          className={cn(
            "flex items-center w-8 h-8 rounded-full justify-center gap-1",
            speedMultiplier > 1 && !isReverse
              ? "bg-primary text-white"
              : "hover:bg-secondary hover:text-secondary-foreground"
          )}
        >
          <FastForward size={12} />
          {speedMultiplier > 1 && !isReverse && (
            <span className="text-[.5rem] font-bold">x{speedMultiplier}</span>
          )}
        </button>
      </div>

      {nearestItem && (
        <CollapsibleController
          className="absolute right-4 bottom-20 top-32 z-10 overflow-y-hidden overflow-x-hidden"
          OpenIcon={Info}
          contents={(setIsOpen) => (
            <NearbyItem item={nearestItem} onClose={() => setIsOpen(false)} />
          )}
        ></CollapsibleController>
      )}
    </>
  );
}
