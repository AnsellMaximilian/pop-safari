"use client";

import { Safari, SafariPolygon, SafariSpot } from "@/type";
import defSafari from "@/assets/safari.svg";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SafariPageContext,
  SafariPageMode,
  SafariViewMode,
} from "./SafarisSection";
import { Button } from "@/components/ui/button";
import { GroundPoint } from "@/components/Point";
import { Eye, Trash, X } from "lucide-react";
import { CollapsibleContext } from "@/components/CollapsibleController";
import { FlyCameraOptions, LatLng } from "@/type/maps";
import {
  findCenter,
  flyAlongRoute,
  getElevation,
  getElevationforPoint,
} from "@/lib/maps";
import { config, databases, storage } from "@/lib/appwrite";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function SafariTour({}: {}) {
  const {
    setPageMode,
    setSafariPolygons,
    setSafariSpots,
    setSafariViewMode,
    routeDecodedPath,
    setRouteDecodedPath,
    map,
  } = useContext(SafariPageContext);
  const { setOpen } = useContext(CollapsibleContext);
  const { toast } = useToast();

  const [speed, setSpeed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReversed, setIsReversed] = useState(false);

  const [test, settest] = useState(0);

  const currentStep = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  // Adjusted duration for animation based on speed
  const durationPerStep = 500 / speed;

  const animateStep = (startTime: number) => (time: number) => {
    if (!isPlaying || !map) return;
    // Calculate progress
    const progress = (time - startTime) / durationPerStep;
    const easedProgress = Math.min(progress, 1);

    const direction = isReversed ? -1 : 1;
    const stepIndex = currentStep.current;
    const startCenter = map.center!;
    const targetCenter = routeDecodedPath[stepIndex];

    map.center = {
      lat:
        startCenter.lat +
        (targetCenter.latitude - startCenter.lat) * easedProgress,
      lng:
        startCenter.lng +
        (targetCenter.longitude - startCenter.lng) * easedProgress,
      altitude: startCenter.altitude || 50,
    };

    if (easedProgress < 1) {
      animationFrameId.current = requestAnimationFrame(animateStep(startTime));
    } else {
      currentStep.current += direction;
      if (
        (direction === 1 && currentStep.current < routeDecodedPath.length) ||
        (direction === -1 && currentStep.current >= 0)
      ) {
        animationFrameId.current = requestAnimationFrame(
          animateStep(performance.now())
        );
      } else {
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(
        animateStep(performance.now())
      );
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isPlaying, speed, isReversed]);

  const handlePlayPause = () => {
    if (map && routeDecodedPath.length > 0) {
      flyAlongRoute(map, routeDecodedPath, 500, test + "");
      settest((prev) => prev + 1);
    }

    // setIsPlaying(!isPlaying)
  };
  const handleReverse = () => setIsReversed((prev) => !prev);
  const handleSpeedChange = (newSpeed: number) => setSpeed(newSpeed);

  return (
    <div className="bg-white p-4 rounded-md shadow-md w-[500px] grow flex flex-col overflow-y-auto">
      <div className="controls">
        <button onClick={handlePlayPause}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button onClick={handleReverse}>Reverse</button>
        <button onClick={() => handleSpeedChange(0.5)}>0.5x</button>
        <button onClick={() => handleSpeedChange(1)}>1x</button>
        <button onClick={() => handleSpeedChange(2)}>2x</button>
      </div>
    </div>
  );
}
