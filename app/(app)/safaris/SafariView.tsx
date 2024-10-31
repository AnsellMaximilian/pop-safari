"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Safari, SafariStatus } from "@/type";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import React, { useContext } from "react";
import { SafariPageContext, SafariPageMode } from "./page";
import SafariStatusBadge from "./SafariStatusBadge";
import { Input } from "@/components/ui/input";
import { computeRoute, getBaseRouteRequest, loader } from "@/lib/maps";

export default function SafariView({ safari }: { safari: Safari }) {
  const { setPageMode, setSelectedSafari, points, map } =
    useContext(SafariPageContext);
  return (
    <>
      <div className="absolute top-4 left-4 z-10 bg-white rounded-md shadow-md p-4">
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
          <div>
            <h2 className="font-bold text-xs">Safari Mode</h2>
            <div className="flex gap-2">
              <h1>{safari.title}</h1>
              <SafariStatusBadge safari={safari} />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-16 left-4 bg-white rounded-md shadow-md z-10 p-4">
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
            });

            console.log(res);
          }}
        >
          Route
        </Button>
      </div>
    </>
  );
}
