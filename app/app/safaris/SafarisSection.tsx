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
import { Comment, Safari, SafariPolygon, SafariSpot } from "@/type";
import SafariView from "./SafariView";
import {
  computeRoute,
  createPolygon,
  createPulseEffect,
  getBaseRouteRequest,
  getElevation,
  getNearbyPlaces,
  getPlaceDetails,
  initAutocomplete,
  loader,
} from "@/lib/maps";
import { Input } from "@/components/ui/input";
import { FlyCameraOptions, LatLng, Map3dEvent, PlaceData } from "@/type/maps";
import {
  COMMENT_MARKER,
  NEARBY_MARKER,
  POLYGON,
  POLYGON_POINT,
  polylineOptions,
  ROUTE_MARKER,
  ROUTE_POLYLINE,
  SAFARI_SPOT,
  SEARCH_PLACE_MARKER,
  TOUR_MARKER,
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
import OtherSafarisList from "./OtherSafarisList";

export interface ExtraSpotData {
  placeId?: string;
}

export enum SafariViewMode {
  ROUTE = "ROUTE",
  SEARCH = "SEARCH",
  POLYGON = "POLYGON",
  HOME = "HOME",
  TOUR = "TOUR",
  COMMENTS = "COMMENTS",
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

  routeDecodedPath: LatLng[];
  setRouteDecodedPath: SetState<LatLng[]>;

  comments: Comment[];
  setComments: SetState<Comment[]>;

  commentPoint: null | LatLng;
  setCommentPoint: SetState<null | LatLng>;

  selectedPolygon: null | SafariPolygon;
  setSelectedPolygon: SetState<null | SafariPolygon>;

  selectedSpot: null | SafariSpot;
  setSelectedSpot: SetState<null | SafariSpot>;
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

  routeDecodedPath: [],
  setRouteDecodedPath: () => {},

  comments: [],
  setComments: () => {},

  commentPoint: null,
  setCommentPoint: () => {},

  selectedPolygon: null,
  setSelectedPolygon: () => {},

  selectedSpot: null,
  setSelectedSpot: () => {},
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
  const [routeDecodedPath, setRouteDecodedPath] = useState<LatLng[]>([]);

  // polygons
  const [polygonPoints, setPolygonPoints] = useState<LatLng[]>([]);
  const [currentPolygonPoints, setCurrentPolygonPoints] = useState<LatLng[]>(
    []
  );

  const [currentPolygonId, setCurrentPolygonId] = useState<string | null>(null);

  const [safariPolygons, setSafariPolygons] = useState<SafariPolygon[]>([]);

  //comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentPoint, setCommentPoint] = useState<LatLng | null>(null);

  const [selectedPolygon, setSelectedPolygon] = useState<null | SafariPolygon>(
    null
  );
  const [selectedSpot, setSelectedSpot] = useState<null | SafariSpot>(null);

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
    setPlace(null);
    if (safariViewMode !== SafariViewMode.ROUTE)
      removeElementsWithClass(ROUTE_MARKER);

    if (safariViewMode !== SafariViewMode.COMMENTS)
      removeElementsWithClass(COMMENT_MARKER);

    if (safariViewMode !== SafariViewMode.HOME) {
      setSelectedPolygon(null);
      setSelectedSpot(null);
    }

    if (safariViewMode !== SafariViewMode.TOUR) {
      removeElementsWithClass(TOUR_MARKER);
      removeElementsWithClass(NEARBY_MARKER);
    }

    if (safariViewMode !== SafariViewMode.SEARCH)
      removeElementsWithClass(SEARCH_PLACE_MARKER);

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
            const placeDetails = await getPlaceDetails(e.placeId);

            setPlace(placeDetails);
            setExtraSpotData((prev) => ({
              ...prev,
              placeId: placeDetails ? placeDetails.id : undefined,
            }));
          } else {
            setPlace(null);
            setExtraSpotData((prev) => ({ ...prev, placeId: undefined }));
          }

          removeElementsWithClass(ROUTE_MARKER);

          const markerWithCustomSvg = await MarkerUtils.createImageMarker(
            latLng.latitude,
            latLng.longitude,
            "/dot-marker.svg",
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
        } else if (safariViewMode === SafariViewMode.COMMENTS) {
          setCommentPoint(latLng);

          removeElementsWithClass(COMMENT_MARKER);

          const markerWithCustomSvg = await MarkerUtils.createImageMarker(
            latLng.latitude,
            latLng.longitude,
            "/comment-marker.svg",
            COMMENT_MARKER,
            true
          );

          map?.append(markerWithCustomSvg);
        } else if (safariViewMode === SafariViewMode.SEARCH && map) {
          createPulseEffect(
            map,
            {
              latitude: latLng.latitude,
              longitude: latLng.longitude,
            },
            3,
            500
          );

          const nearbyPlaces = await getNearbyPlaces(
            latLng.latitude,
            latLng.longitude,
            map,
            500,
            async (place) => {
              try {
                const placeDetails = await getPlaceDetails(place.id);
                setPlace(placeDetails);
              } catch (error) {}
            }
          );
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

        databases
          .listDocuments(config.dbId, config.commentCollectionId, [
            Query.equal("safariId", selectedSafari.$id),
          ])
          .then((docs) => {
            const comments = docs.documents as Comment[];
            setComments(comments);
          });

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
      removeElementsWithClass(SAFARI_SPOT);

      if (map && safariSpots.length > 0) {
        // markers
        safariSpots.forEach(async (s) => {
          const markerWithCustomSvg = await MarkerUtils.createImageMarker(
            s.lat,
            s.lng,
            "/dot-marker.svg",
            SAFARI_SPOT,
            false,
            (event) => {
              event.stopPropagation();
              setSafariViewMode(SafariViewMode.HOME);
              setSelectedSpot(s);
              setSelectedPolygon(null);
            }
          );

          map?.append(markerWithCustomSvg);
        });
        removeElementsWithClass(ROUTE_POLYLINE);

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

            setRouteDecodedPath(
              decodedPath.map((p) => ({
                latitude: p.lat(),
                longitude: p.lng(),
              }))
            );

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
        routeDecodedPath,
        setRouteDecodedPath,
        comments,
        setComments,
        commentPoint,
        setCommentPoint,
        selectedPolygon,
        setSelectedPolygon,
        selectedSpot,
        setSelectedSpot,
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
            "absolute top-4 left-4 z-10 bottom-4 md:w-[500px] lg:w-[700px] max-w-full transition-all duration-500 flex flex-col overflow-y-auto",
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
                <>
                  <SafariList />
                  <div className="mt-4">
                    <OtherSafarisList />
                  </div>
                </>
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

                  <div className="mt-auto w-full">
                    <OtherSafarisList />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div
          className={cn(
            "absolute top-4 left-4 z-10 bottom-4 md:w-[500px] max-w-full transition-all duration-500 flex flex-col overflow-y-auto",
            pageMode === SafariPageMode.CREATE
              ? "translate-x-0"
              : "-translate-x-[1000px]"
          )}
        >
          <Card className="w-full grow">
            <CardHeader className="text-center">
              <CardTitle className="">Create Safari</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateSafari
                onFinishCreate={async () => setPageMode(SafariPageMode.VIEW)}
              />
            </CardContent>
          </Card>
        </div>

        <Header />
      </>
    </SafariPageContext.Provider>
  );
}
