"use client";

import { Safari, SafariPolygon, SafariSpot } from "@/type";
import React, { useContext, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SafariPageContext, SafariPageMode, SafariViewMode } from "./page";
import { Button } from "@/components/ui/button";
import { GroundPoint } from "@/components/Point";
import { Eye, Trash, X } from "lucide-react";
import { CollapsibleContext } from "@/components/CollapsibleController";
import { FlyCameraOptions, LatLng } from "@/type/maps";
import { findCenter, getElevation, getElevationforPoint } from "@/lib/maps";
import { config, databases } from "@/lib/appwrite";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function SafariDetails({
  safari,
  spots,
  polygons,
}: {
  safari: Safari;
  spots: SafariSpot[];
  polygons: SafariPolygon[];
}) {
  const {
    setPageMode,
    map,
    setSafariPolygons,
    setSafariSpots,
    setSafariViewMode,
  } = useContext(SafariPageContext);
  const { setOpen } = useContext(CollapsibleContext);
  const { toast } = useToast();

  const [isDeleting, setisDeleting] = useState(false);

  return (
    <div className="bg-white p-4 rounded-md shadow-md w-[500px] grow flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Safari Details</h2>
        <Button variant="outline" size="icon" onClick={() => setOpen(false)}>
          <X />
        </Button>
      </div>
      <Tabs defaultValue="general" className="w-full mt-4 grow flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger className="grow" value="general">
            General
          </TabsTrigger>
          <TabsTrigger className="grow" value="spots">
            Spots
          </TabsTrigger>
          <TabsTrigger className="grow" value="polygons">
            Polygons
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4 grow ">
          <div className="text-[0.8rem] text-muted-foreground text-center">
            This section shows general details for the Safari you&apos;re
            currently viewing.
          </div>
          <div>
            {safari.description ? safari.description : "No description."}
          </div>
        </TabsContent>
        <TabsContent value="spots" className="space-y-4 grow ">
          <div className="text-[0.8rem] text-muted-foreground text-center">
            The spots you&apos;ve picked out for your Safari. Switch to{" "}
            <span
              className="text-primary hover:text-primary/70 cursor-pointer"
              onClick={() => {
                setSafariViewMode(SafariViewMode.ROUTE);
                toast({
                  description: "Click anywhere to map your Safari Spot",
                });
              }}
            >
              "Spot Mode"
            </span>{" "}
            to create Safari Spots.
          </div>

          {spots.length > 0 ? (
            <div className="flex flex-col gap-2">
              {spots.map((s) => (
                <div
                  key={s.$id}
                  className="p-4 text-sm border border-border rounded-md space-y-2"
                >
                  <div className="gap-2 justify-between flex items-center">
                    <div>{s.name}</div>
                    <div className="flex gap-2 items-center">
                      <Button
                        disabled={isDeleting}
                        variant="outline"
                        size="icon"
                        onClick={async () => {
                          if (map) {
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
                        }}
                      >
                        <Eye />
                      </Button>
                      <Button
                        onClick={async () => {
                          try {
                            setisDeleting(true);
                            await databases.deleteDocument(
                              config.dbId,
                              config.safariStopCollectionId,
                              s.$id
                            );
                            setSafariSpots((prev) =>
                              prev.filter((cs) => cs.$id != s.$id)
                            );
                          } catch (error) {
                            toast({
                              variant: "destructive",
                              title: "Error deleting spot",
                              description:
                                error instanceof Error
                                  ? error.message
                                  : "Something went wrong.",
                            });
                          } finally {
                            setisDeleting(false);
                          }
                        }}
                        disabled={isDeleting}
                        variant="destructive"
                        size="icon"
                      >
                        <Trash />
                      </Button>
                    </div>
                  </div>
                  <GroundPoint point={{ latitude: s.lat, longitude: s.lng }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center flex-col gap-4 py-4">
              <Image
                src="/spot-marker.svg"
                width={200}
                height={200}
                alt="Empty Spots"
                className="w-56"
              />
              <Button
                onClick={() => {
                  setSafariViewMode(SafariViewMode.ROUTE);
                  toast({
                    description: "Click anywhere to map your Safari Spot",
                  });
                }}
              >
                Create Spots
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="polygons" className="space-y-4 grow ">
          <div className="text-[0.8rem] text-muted-foreground text-center">
            Polygons for places, buildings, etc. that you&apos;ve highlighted.
            Switch to{" "}
            <span
              className="text-primary hover:text-primary/70 cursor-pointer"
              onClick={() => {
                setSafariViewMode(SafariViewMode.POLYGON);
                toast({
                  description: "Click anywhere to map your Polygon points",
                });
              }}
            >
              "Polygon Mode"
            </span>{" "}
            to create Polygons.
          </div>
          {polygons.length > 0 ? (
            <div className="flex flex-col gap-2">
              {polygons.map((pol) => {
                const center = findCenter(
                  pol.points.map((p) => JSON.parse(p) as LatLng)
                );

                return (
                  <div
                    key={pol.$id}
                    className="p-4 text-sm border border-border rounded-md space-y-2"
                  >
                    <div className="gap-2 justify-between flex items-center">
                      <div>{pol.title}</div>
                      <div className="flex gap-2 items-center">
                        <Button
                          disabled={isDeleting}
                          variant="outline"
                          size="icon"
                          onClick={async () => {
                            if (map) {
                              const opts: FlyCameraOptions = {
                                endCamera: {
                                  center: {
                                    lat: center.latitude,
                                    lng: center.longitude,
                                    altitude: await getElevation({
                                      latitude: center.latitude,
                                      longitude: center.longitude,
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
                          }}
                        >
                          <Eye />
                        </Button>
                        <Button
                          onClick={async () => {
                            try {
                              setisDeleting(true);
                              await databases.deleteDocument(
                                config.dbId,
                                config.polygonCollectionId,
                                pol.$id
                              );
                              setSafariPolygons((prev) =>
                                prev.filter((curPols) => curPols.$id != pol.$id)
                              );
                            } catch (error) {
                              toast({
                                variant: "destructive",
                                title: "Error deleting polygon",
                                description:
                                  error instanceof Error
                                    ? error.message
                                    : "Something went wrong.",
                              });
                            } finally {
                              setisDeleting(false);
                            }
                          }}
                          disabled={isDeleting}
                          variant="destructive"
                          size="icon"
                        >
                          <Trash />
                        </Button>
                      </div>
                    </div>
                    <GroundPoint point={center} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center flex-col gap-4 py-4">
              <Image
                src="/polygon-marker.svg"
                width={200}
                height={200}
                alt="Empty Spots"
                className="w-56"
              />
              <Button
                onClick={() => {
                  setSafariViewMode(SafariViewMode.POLYGON);
                  toast({
                    description: "Click anywhere to map your Polygon points",
                  });
                }}
              >
                Create Polygons
              </Button>
            </div>
          )}{" "}
        </TabsContent>
      </Tabs>
    </div>
  );
}
