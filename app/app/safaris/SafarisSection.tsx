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
import UserMenu from "@/components/UserMenu";
import emptySafari from "@/assets/empty-safari.svg";
import { useData } from "@/contexts/data/DataContext";
import SafariList from "./SafariList";
import CreateSafari from "./CreateSafari";
import { Safari, SafariPolygon, SafariSpot } from "@/type";
import SafariView from "./SafariView";
import {
  animateCameraAlongRouteWithForwardLooking,
  computeRoute,
  createPolygon,
  flyAlongRoute,
  getBaseRouteRequest,
  getElevation,
  getPlaceDetails,
  initAutocomplete,
  loader,
} from "@/lib/maps";
import { Input } from "@/components/ui/input";
import { FlyCameraOptions, LatLng, Map3dEvent, PlaceData } from "@/type/maps";
import {
  POLYGON,
  POLYGON_POINT,
  polylineOptions,
  ROUTE_MARKER,
  ROUTE_POLYLINE,
  SAFARI_SPOT,
} from "@/const/maps";
import {
  MarkerUtils,
  removeElementsWithClass,
  removeElementsWithSelector,
} from "@/utils/maps";
import { config, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { excludeStartAndEnd, hexToRGBA } from "@/utils/common";
import { useAppData } from "../useAppData";
import Header from "../Header";

export interface ExtraSpotData {
  placeId?: string;
}

export enum SafariViewMode {
  ROUTE = "ROUTE",
  SEARCH = "SEARCH",
  POLYGON = "POLYGON",
  HOME = "HOME",
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

  // polygons
  polygonPoints: LatLng[];
  setPolygonPoints: SetState<LatLng[]>;

  currentPolygonPoints: LatLng[];
  setCurrentPolygonPoints: SetState<LatLng[]>;

  currentPolygonId: string | null;
  setCurrentPolygonId: SetState<string | null>;

  safariPolygons: SafariPolygon[];
  setSafariPolygons: SetState<SafariPolygon[]>;
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

  polygonPoints: [],
  setPolygonPoints: () => {},

  currentPolygonPoints: [],
  setCurrentPolygonPoints: () => {},

  currentPolygonId: null,
  setCurrentPolygonId: () => {},

  safariPolygons: [],
  setSafariPolygons: () => {},
});

export default function SafariSection() {
  const { map, setMap, mapRef } = useAppData();
  const [pageMode, setPageMode] = useState<SafariPageMode>(SafariPageMode.VIEW);

  // When in details mode
  const [safariViewMode, setSafariViewMode] = useState(SafariViewMode.HOME);

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

  // polygons
  const [polygonPoints, setPolygonPoints] = useState<LatLng[]>([]);
  const [currentPolygonPoints, setCurrentPolygonPoints] = useState<LatLng[]>(
    []
  );

  const [currentPolygonId, setCurrentPolygonId] = useState<string | null>(null);

  const [safariPolygons, setSafariPolygons] = useState<SafariPolygon[]>([]);

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
    if (safariViewMode !== SafariViewMode.ROUTE)
      removeElementsWithClass(ROUTE_MARKER);

    const handleMapClick: EventListenerOrEventListenerObject = (basicE) => {
      loader.load().then(async () => {
        // @ts-ignore
        const { Marker3DElement } = (await google.maps.importLibrary(
          "maps3d"
        )) as google.maps.Maps3DLibrary;
        const e: Map3dEvent = basicE as Map3dEvent;
        const latLng: LatLng = {
          latitude: e.position ? e.position.lat : 0,
          longitude: e.position ? e.position.lng : 0,
        };

        if (safariViewMode === SafariViewMode.ROUTE) {
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
        } else if (safariViewMode === SafariViewMode.POLYGON) {
          removeElementsWithClass(POLYGON_POINT);
          setPolygonPoints((prev) => {
            const newVal = [...prev, latLng];
            newVal.forEach(async (p) => {
              const markerWithCustomSvg = await MarkerUtils.createImageMarker(
                p.latitude,
                p.longitude,
                "/polygon-point.svg",
                POLYGON_POINT
              );

              map?.append(markerWithCustomSvg);
            });

            return newVal;
          });
        }
      });
    };
    if (map) {
      map.addEventListener("gmp-click", handleMapClick);
    }

    return () => {
      map?.removeEventListener("gmp-click", handleMapClick);
    };
  }, [map, safariViewMode]);

  useEffect(() => {
    (async () => {
      if (selectedSafari) {
        removeElementsWithClass(SAFARI_SPOT);
        removeElementsWithClass(ROUTE_POLYLINE);
        removeElementsWithClass(POLYGON);

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

        const polygons = (
          await databases.listDocuments(
            config.dbId,
            config.polygonCollectionId,
            [Query.equal("safariId", selectedSafari.$id)]
          )
        ).documents as SafariPolygon[];
        setSafariPolygons(polygons);

        if (spots.length > 0) {
          if (map) {
            const s = spots[0];
            const opts: FlyCameraOptions = {
              endCamera: {
                center: {
                  lat: s.lat,
                  lng: s.lng,
                  altitude: await getElevation({
                    latitude: s.lat,
                    longitude: s.lng,
                  }),
                },
                range: 1000,
                tilt: 67.5,
              },
              durationMillis: 1000,
            };
            // @ts-ignore
            map.flyCameraTo(opts);
          }
        }
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

        if (res?.routes?.length) {
          loader.load().then(async () => {
            const { encoding } = (await google.maps.importLibrary(
              "geometry"
            )) as google.maps.GeometryLibrary;

            const decodedPath = encoding.decodePath(
              res.routes[0].polyline.encodedPolyline
            );

            // setTimeout(() => {
            //   flyAlongRoute(
            //     map,
            //     decodedPath.map((p) => ({
            //       latitude: p.lat(),
            //       longitude: p.lng(),
            //     }))
            //   );
            // }, 5000);

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
      }
    })();
  }, [safariSpots, map]);

  useEffect(() => {
    (async () => {
      if (map) {
        removeElementsWithSelector(`.${POLYGON}`);
        safariPolygons.forEach((p) => {
          let points: LatLng[] = [];

          try {
            points = p.points.map((ps) => JSON.parse(ps)) as LatLng[];
          } catch (error) {}

          createPolygon(
            map,
            points,
            p.altitude,
            p.$id,
            p.strokeColor,
            hexToRGBA(p.fillColor, p.opacity)
          );
        });
      }
    })();
  }, [safariPolygons, map]);
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
        polygonPoints,
        setPolygonPoints,
        currentPolygonId,
        setCurrentPolygonId,
        currentPolygonPoints,
        setCurrentPolygonPoints,
        safariPolygons,
        setSafariPolygons,
      }}
    >
      <>
        <div
          className={cn(
            "absolute left-[320px] bg-white rounded-md shadow-md z-10 top-4 duration-500",
            pageMode === SafariPageMode.DETAILS
              ? "translate-y-0"
              : "-translate-y-[1000px]"
          )}
        >
          <Input
            id="pac-input"
            placeholder="Search for place"
            className="w-96"
          />
        </div>
        {selectedSafari && pageMode === SafariPageMode.DETAILS && (
          <SafariView safari={selectedSafari} />
        )}
        <div
          className={cn(
            "absolute top-4 left-4 z-10 bottom-4 md:w-[500px] max-w-full transition-all duration-500 flex flex-col overflow-y-auto",
            pageMode === SafariPageMode.VIEW
              ? "translate-x-0"
              : "-translate-x-[1000px]"
          )}
        >
          <Card className="w-full grow">
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
        </div>

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

        <Header />
      </>
    </SafariPageContext.Provider>
  );
}
