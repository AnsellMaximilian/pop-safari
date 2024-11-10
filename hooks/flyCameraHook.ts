import { getAltitudesForPoints } from "@/lib/maps";
import { LatLng, LatLngAlt } from "@/type/maps";
import { useEffect, useRef } from "react";

export function flyAlongRoute(
  map: google.maps.maps3d.Map3DElement,
  pointsWithAltitudes: LatLngAlt[],
  durationPerStep: number = 500
) {
  const isPaused = useRef(false);
  const animationFrameId = useRef<number | null>(null);
  const currentStep = useRef(0);

  function flyToNextStep() {
    if (currentStep.current >= pointsWithAltitudes.length - 1) return;

    const startCenter = map.center!;
    const targetCenter = pointsWithAltitudes[currentStep.current];
    const startTilt = map.tilt || 45;
    const targetTilt = 45;
    const startHeading = map.heading || 10;
    const targetHeading = startHeading + 10;
    const startRange = map.range || 500;
    const targetRange = 500;

    let startTime: number | null = null;

    function animateStep(time: number) {
      if (isPaused.current) {
        animationFrameId.current = requestAnimationFrame(animateStep);
        return; // Exit animation loop if paused
      }

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

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animateStep);
      } else {
        currentStep.current++;
        flyToNextStep();
      }
    }

    animationFrameId.current = requestAnimationFrame(animateStep);
  }

  function pause() {
    isPaused.current = true;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  }

  function resume() {
    if (isPaused.current) {
      isPaused.current = false;
      flyToNextStep(); // Resume from the current step
    }
  }

  useEffect(() => {
    flyToNextStep();
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [map, pointsWithAltitudes, durationPerStep]);

  return { pause, resume };
}
