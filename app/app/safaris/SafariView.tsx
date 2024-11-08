"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Safari, SafariSpot, SafariStatus } from "@/type";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import React, { useContext, useState } from "react";
import {
  SafariPageContext,
  SafariPageMode,
  SafariViewMode,
} from "./SafarisSection";
import SafariStatusBadge from "./SafariStatusBadge";
import {
  MapPin,
  Search,
  Box,
  MapPinHouse,
  BoxIcon,
  Home,
  Info,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useForm } from "react-hook-form";

import PlaceDisplay from "@/components/PlaceDisplay";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import SafariCreateForm from "./SafariCreateForm";
import CollapsibleController from "@/components/CollapsibleController";
import PolygonControls from "./PolygonControls";
import SafariDetails from "./SafariDetails";
import { truncateString } from "@/utils/common";
import { X } from "lucide-react";

export default function SafariView({ safari }: { safari: Safari }) {
  const {
    setPageMode,
    setSelectedSafari,
    points,
    map,
    selectedSafari,
    safariViewMode,
    setSafariViewMode,
    place,
    extraSpotData,
    setExtraSpotData,
    currentPoint,
    safariPolygons,
    safariSpots,
  } = useContext(SafariPageContext);

  return (
    <>
      <div className="absolute top-4 left-4 z-10 bg-white rounded-md shadow-md p-4 w-[300px]">
        <div className="flex gap-4 items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setPageMode(SafariPageMode.VIEW);
              setSelectedSafari(null);
            }}
          >
            <ChevronLeftIcon />
          </Button>
          <div className="grow">
            <h2 className="font-bold text-xs">Safari Mode</h2>
            <div className="flex gap-2 justify-between">
              <h1>{truncateString(safari.title, 15)}</h1>
              <SafariStatusBadge safari={safari} />
            </div>
          </div>
        </div>
        <Separator className="mt-4 mb-2" />

        <ToggleGroup
          type="multiple"
          className=""
          value={[safariViewMode]}
          onValueChange={(val) => {
            setSafariViewMode((prev) => {
              console.log({ val });
              if (val.length > 0) return val[val.length - 1] as SafariViewMode;

              return SafariViewMode.HOME;
            });
          }}
        >
          <ToggleGroupItem
            value={SafariViewMode.HOME}
            aria-label="Toggle Home Mode"
            className="border-border border"
          >
            <Home className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value={SafariViewMode.ROUTE}
            aria-label="Toggle Route Mode"
            className="border-border border"
          >
            <MapPin className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value={SafariViewMode.SEARCH}
            aria-label="Toggle Search Mode"
            className="border-border border"
          >
            <Search className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value={SafariViewMode.POLYGON}
            aria-label="Toggle Polygon Mode"
            className="border-border border"
          >
            <Box className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {selectedSafari && safariViewMode === SafariViewMode.HOME && (
        <CollapsibleController
          className="absolute left-4 top-44 bottom-4 z-10 items-start overflow-y-hidden"
          OpenIcon={Info}
          direction="LEFT"
          contents={() => (
            <SafariDetails
              safari={selectedSafari}
              polygons={safariPolygons}
              spots={safariSpots}
            />
          )}
        ></CollapsibleController>
      )}

      {currentPoint && safariViewMode === SafariViewMode.ROUTE && (
        <SafariCreateForm />
      )}

      {safariViewMode === SafariViewMode.POLYGON && (
        <CollapsibleController
          className="absolute left-4 top-44 bottom-4 z-10 items-start"
          OpenIcon={BoxIcon}
          direction="LEFT"
          contents={() => <PolygonControls />}
        />
      )}

      {place && (
        <CollapsibleController
          key={place.id}
          className="absolute right-4 top-44 bottom-4 z-10"
          OpenIcon={MapPinHouse}
          contents={(setOpen) => (
            <div className="rounded-md shadow-md bg-white p-4 max-w-[500px] grow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Found Place</h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setOpen(false)}
                >
                  <X />
                </Button>
              </div>
              <PlaceDisplay place={place} />
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="associate-place"
                    checked={!!extraSpotData?.placeId}
                    onCheckedChange={(val) => {
                      setExtraSpotData((prev) => ({
                        ...prev,
                        placeId: val ? place.id : undefined,
                      }));
                    }}
                  />
                  <Label htmlFor="associate-place">Connect to Activity</Label>
                </div>
              </div>
            </div>
          )}
        />
      )}

      {/* <div className="absolute top-44 left-4 bg-white rounded-md shadow-md z-10 p-4">
        <Button
          disabled={points.length < 2}
          onClick={async () => {
            const res = await computeRoute(
              getBaseRouteRequest(points[0], points[1])
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

            console.log(res);
          }}
        >
          Route
        </Button>
      </div> */}
    </>
  );
}