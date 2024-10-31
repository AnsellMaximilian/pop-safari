"use client";
import logo from "@/assets/pop-safari-logo.svg";
import { z } from "zod";
import defBusiness from "@/assets/default-business.svg";

import Map3D from "@/components/Map3D";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { NavItem } from "../layout";
import UserMenu from "@/components/UserMenu";
import emptySafari from "@/assets/empty-safari.svg";
import { useData } from "@/contexts/data/DataContext";
import SafariList from "./SafariList";
import CreateSafari from "./CreateSafari";
import { Safari, SafariStatus } from "@/type";
import { Badge } from "@/components/ui/badge";
import SafariView from "./SafariView";
import { initAutocomplete, loader } from "@/lib/maps";
import { Input } from "@/components/ui/input";
import { LatLng, Map3dEvent } from "@/type/maps";
import { GENERAL_MARKER_ONE, ROUTE_MARKER } from "@/const/maps";
import { MarkerUtils, removeElementsWithClass } from "@/utils/maps";

export enum SafariViewMode {
  ROUTE = "ROUTE",
  SEARCH = "SEARCH",
  POLYGON = "POLYGON",
}

export enum SafariPageMode {
  CREATE = "CREATE",
  VIEW = "VIEW",
  DETAILS = "DETAILS",
}

export type SetState<T> = Dispatch<SetStateAction<T>>;

export interface SafariPageContextData {
  pageMode: SafariPageMode;
  setPageMode: Dispatch<SetStateAction<SafariPageMode>>;
  selectedSafari: Safari | null;
  setSelectedSafari: Dispatch<SetStateAction<Safari | null>>;
  map: google.maps.maps3d.Map3DElement | null;
  setMap: Dispatch<SetStateAction<google.maps.maps3d.Map3DElement | null>>;
  points: LatLng[];
  setPoints: SetState<LatLng[]>;
  safariViewMode: SafariViewMode;
  setSafariViewMode: SetState<SafariViewMode>;
}

export const SafariPageContext = createContext<SafariPageContextData>({
  pageMode: SafariPageMode.VIEW,
  setPageMode: () => {},
  setSelectedSafari: () => {},
  selectedSafari: null,
  map: null,
  setMap: () => {},
  points: [],
  setPoints: () => {},
  safariViewMode: SafariViewMode.ROUTE,
  setSafariViewMode: () => {},
});

export default function Page() {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [pageMode, setPageMode] = useState<SafariPageMode>(SafariPageMode.VIEW);

  // When in details mode
  const [safariViewMode, setSafariViewMode] = useState(SafariViewMode.ROUTE);

  const [selectedSafari, setSelectedSafari] = useState<Safari | null>(null);

  const { safaris } = useData();

  const [points, setPoints] = useState<LatLng[]>([]);

  useEffect(() => {
    let autocompleteListener: google.maps.MapsEventListener | null = null;

    if (map)
      initAutocomplete(map, async (place) => {}).then((listener) => {
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
        const latLng: LatLng = {
          latitude: e.position.lat,
          longitude: e.position.lng,
        };

        setPoints((prev) => {
          const newVal =
            prev.length >= 2 ? [prev[1], latLng] : [...prev, latLng];
          removeElementsWithClass(ROUTE_MARKER);

          newVal.forEach(async (latLng) => {
            const markerWithCustomSvg = await MarkerUtils.createImageMarker(
              latLng.latitude,
              latLng.longitude,
              "/pop-safari-marker.svg",
              ROUTE_MARKER
            );

            map?.append(markerWithCustomSvg);
          });
          return newVal;
        });

        // const marker = new Marker3DElement({
        //   position: { lat: e.position.lat, lng: e.position.lng },
        //   label: "Clicked",
        //   icon: {
        //     url: "/default-business.svg", // Image path (should be accessible in the public directory or via URL)
        //     scaledSize: { width: 50, height: 50 }, // Optional: Adjust the image size
        //   },
        // });

        // if (map) {
        //   removeElementsWithClass(GENERAL_MARKER_ONE);
        //   marker.classList.add(GENERAL_MARKER_ONE);
        //   map.append(marker);
        // }
      });
    };
    if (map) {
      map.addEventListener("gmp-click", handleMapClick);
    }

    return () => {
      map?.removeEventListener("gmp-click", handleMapClick);
    };
  }, [map]);
  return (
    <SafariPageContext.Provider
      value={{
        pageMode,
        setPageMode,
        setSelectedSafari,
        selectedSafari,
        map,
        setMap,
        points,
        setPoints,
        safariViewMode,
        setSafariViewMode,
      }}
    >
      <Map3D mapRef={mapRef} setMap={setMap} className="fixed inset-0">
        <div
          className={cn(
            "absolute left-96 bg-white rounded-md shadow-md p-4 z-10 top-4 duration-500",
            pageMode === SafariPageMode.DETAILS
              ? "translate-y-0"
              : "-translate-y-[1000px]"
          )}
        >
          <Input id="pac-input" placeholder="Search for place" />
        </div>
        {selectedSafari && pageMode === SafariPageMode.DETAILS && (
          <SafariView safari={selectedSafari} />
        )}
        <Card
          className={cn(
            "absolute top-4 left-4 z-10 bottom-4 md:w-[500px] max-w-full transition-all duration-500",
            pageMode === SafariPageMode.VIEW
              ? "translate-x-0"
              : "-translate-x-[1000px]"
          )}
        >
          <CardHeader className="text-center">
            <CardTitle className="">Safaris</CardTitle>
          </CardHeader>
          <CardContent>
            {safaris.data.length > 0 ? (
              <SafariList />
            ) : (
              <div className="flex flex-col gap-4 items-center mt-16">
                <Image
                  src={emptySafari}
                  width={500}
                  height={500}
                  alt="empty safari"
                  className="w-64"
                />
                <p className="mt-8">
                  Start your own adventures by creating your first{" "}
                  <strong>Safari</strong>
                </p>
                <Button onClick={() => setPageMode(SafariPageMode.CREATE)}>
                  Create Safari
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          className={cn(
            "absolute top-4 left-4 z-10 bottom-4 md:w-[500px] max-w-full transition-all duration-500",
            pageMode === SafariPageMode.CREATE
              ? "translate-x-0"
              : "-translate-x-[1000px]"
          )}
        >
          <CardHeader className="text-center">
            <CardTitle className="">Create Safari</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateSafari
              onFinishCreate={async () => setPageMode(SafariPageMode.VIEW)}
            />
          </CardContent>
        </Card>

        <header className="absolute right-4 top-4 z-10 bg-white p-4 rounded-md shadow-md">
          <nav className="flex gap-8 items-center">
            <Image
              src={logo}
              width={300}
              height={200}
              alt="logo"
              className="w-24"
            />
            <ul className="flex items-center gap-4 text-sm">
              <NavItem label="Dashboard" href="/app/dashboard" />
              <NavItem label="Profile" href="/app/profile" />
            </ul>
            <div className="ml-auto">
              <UserMenu />
            </div>
          </nav>
        </header>
      </Map3D>
    </SafariPageContext.Provider>
  );
}
