"use client";
import logo from "@/assets/pop-safari-logo.svg";

import Map3D from "@/components/Map3D";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { NavItem } from "../layout";
import UserMenu from "@/components/UserMenu";
import emptySafari from "@/assets/empty-safari.svg";
import { useData } from "@/contexts/data/DataContext";
import SafariList from "./SafariList";
import CreateSafari from "./CreateSafari";
import { Safari, SafariSpot } from "@/type";
import SafariView from "./SafariView";
import {
  computeRoute,
  getBaseRouteRequest,
  getPlaceDetails,
  initAutocomplete,
  loader,
} from "@/lib/maps";
import { Input } from "@/components/ui/input";
import { LatLng, Map3dEvent, PlaceData } from "@/type/maps";
import {
  polylineOptions,
  ROUTE_MARKER,
  ROUTE_POLYLINE,
  SAFARI_SPOT,
} from "@/const/maps";
import { MarkerUtils, removeElementsWithClass } from "@/utils/maps";
import { config, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { excludeStartAndEnd } from "@/utils/common";

export interface ExtraSpotData {
  placeId?: string;
}

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
  place: PlaceData | null;
  setPlace: SetState<PlaceData | null>;

  // spot creation
  extraSpotData: null | ExtraSpotData;
  setExtraSpotData: SetState<null | ExtraSpotData>;

  currentPoint: null | LatLng;
  setCurrentPoint: SetState<null | LatLng>;

  safariSpots: SafariSpot[];
  setSafariSpots: SetState<SafariSpot[]>;
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
  place: null,
  setPlace: () => {},

  extraSpotData: null,
  setExtraSpotData: () => {},

  currentPoint: null,
  setCurrentPoint: () => {},

  safariSpots: [],
  setSafariSpots: () => {},
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

  const [place, setPlace] = useState<PlaceData | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  // Spot
  const [extraSpotData, setExtraSpotData] = useState<null | ExtraSpotData>(
    null
  );

  const [safariSpots, setSafariSpots] = useState<SafariSpot[]>([]);

  const [currentPoint, setCurrentPoint] = useState<LatLng | null>(null);

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

        setCurrentPoint(latLng);
        if (e.placeId) {
          console.log(e.placeId);
          const placeDetails = await getPlaceDetails(e.placeId);

          setPlace(placeDetails);
        } else {
          setPlace(null);
          setExtraSpotData((prev) => ({ ...prev, placeId: undefined }));
        }

        removeElementsWithClass(ROUTE_MARKER);

        const markerWithCustomSvg = await MarkerUtils.createImageMarker(
          latLng.latitude,
          latLng.longitude,
          "/pop-safari-marker.svg",
          ROUTE_MARKER
        );

        map?.append(markerWithCustomSvg);

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

  useEffect(() => {
    (async () => {
      if (selectedSafari) {
        removeElementsWithClass(SAFARI_SPOT);
        removeElementsWithClass(ROUTE_POLYLINE);

        const spots = (
          await databases.listDocuments(
            config.dbId,
            config.safariStopCollectionId,
            [
              Query.equal("safariId", selectedSafari.$id),
              Query.orderAsc("order"),
            ]
          )
        ).documents as SafariSpot[];
        setSafariSpots(spots);
      }
    })();
  }, [selectedSafari]);

  useEffect(() => {
    (async () => {
      if (map && safariSpots.length > 0) {
        // markers
        removeElementsWithClass(SAFARI_SPOT);
        safariSpots.forEach(async (s) => {
          const markerWithCustomSvg = await MarkerUtils.createImageMarker(
            s.lat,
            s.lng,
            "/spot-marker.svg",
            SAFARI_SPOT
          );

          map?.append(markerWithCustomSvg);
        });

        if (safariSpots.length < 2) return;

        // route
        const res = await computeRoute(
          getBaseRouteRequest(
            { latitude: safariSpots[0].lat, longitude: safariSpots[0].lng },
            {
              latitude: safariSpots[safariSpots.length - 1].lat,
              longitude: safariSpots[safariSpots.length - 1].lng,
            },
            excludeStartAndEnd(safariSpots).map((s) => ({
              latitude: s.lat,
              longitude: s.lng,
            }))
          )
        );

        loader.load().then(async () => {
          const { encoding } = (await google.maps.importLibrary(
            "geometry"
          )) as google.maps.GeometryLibrary;

          const decodedPath = encoding.decodePath(
            res.routes[0].polyline.encodedPolyline
          );
          console.log(decodedPath);

          removeElementsWithClass(ROUTE_POLYLINE);

          const polyline = new google.maps.maps3d.Polyline3DElement(
            polylineOptions
          );

          polyline.coordinates = decodedPath.map((p) => ({
            lat: p.lat(),
            lng: p.lng(),
          }));
          polyline.classList.add(ROUTE_POLYLINE);

          map?.append(polyline);
        });
      }
    })();
  }, [safariSpots, map]);
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
        place,
        setPlace,
        extraSpotData,
        setExtraSpotData,
        currentPoint,
        setCurrentPoint,
        safariSpots,
        setSafariSpots,
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
