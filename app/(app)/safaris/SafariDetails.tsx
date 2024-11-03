"use client";

import { Safari, SafariPolygon, SafariSpot } from "@/type";
import React, { useContext } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SafariPageContext } from "./page";

export default function SafariDetails({
  safari,
  spots,
  polygons,
}: {
  safari: Safari;
  spots: SafariSpot[];
  polygons: SafariPolygon[];
}) {
  const { setPageMode } = useContext(SafariPageContext);
  return (
    <div className="bg-white p-4 rounded-md shadow-md w-[500px] grow overflow-y-auto">
      <h2 className="font-semibold">Safari Details</h2>
      <Tabs defaultValue="general" className="w-full mt-4">
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
        <TabsContent value="general" className="space-y-4">
          <div className="text-[0.8rem] text-muted-foreground text-center">
            This section shows general details for the Safari you&apos;re
            currently viewing.
          </div>
          <div>
            {safari.description ? safari.description : "No description."}
          </div>
        </TabsContent>
        <TabsContent value="spots" className="space-y-4">
          <div className="text-[0.8rem] text-muted-foreground text-center">
            This section shows general details for the Safari you&apos;re
            currently viewing.
          </div>
          <div>Current Spots: {spots.length}</div>
        </TabsContent>
        <TabsContent value="polygons" className="space-y-4">
          <div className="text-[0.8rem] text-muted-foreground text-center">
            This section shows general details for the Safari you&apos;re
            currently viewing.
          </div>
          <div>Current Polygons: {polygons.length}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
