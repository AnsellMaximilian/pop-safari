"use client";

import { Safari, SafariPolygon, SafariSpot } from "@/type";
import React, { useContext } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SafariPageContext } from "./page";
import { Button } from "@/components/ui/button";
import { GroundPoint } from "@/components/Point";
import { Eye, Trash, X } from "lucide-react";
import { CollapsibleContext } from "@/components/CollapsibleController";
import { FlyCameraOptions } from "@/type/maps";
import { getElevation, getElevationforPoint } from "@/lib/maps";

export default function SafariDetails({
  safari,
  spots,
  polygons,
}: {
  safari: Safari;
  spots: SafariSpot[];
  polygons: SafariPolygon[];
}) {
  const { setPageMode, map } = useContext(SafariPageContext);
  const { setOpen } = useContext(CollapsibleContext);

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
            The spots you&apos;ve picked out for your Safari.
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
                      <Button variant="destructive" size="icon">
                        <Trash />
                      </Button>
                    </div>
                  </div>
                  <GroundPoint point={{ latitude: s.lat, longitude: s.lng }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="">
              <Button>Create Spots</Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="polygons" className="space-y-4 grow ">
          <div className="text-[0.8rem] text-muted-foreground text-center">
            Polygons for places, buildings, etc. that you&apos;ve highlighted.
          </div>
          <div>Current Polygons: {polygons.length}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
