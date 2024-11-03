"use client";

import { Safari, SafariPolygon, SafariSpot } from "@/type";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SafariDetails({
  safari,
  spots,
  polygons,
}: {
  safari: Safari;
  spots: SafariSpot[];
  polygons: SafariPolygon[];
}) {
  return (
    <div className="bg-white p-4 rounded-md shadow-md w-[500px] grow overflow-y-auto">
      <h2 className="font-semibold">Safari Details</h2>
      <Tabs defaultValue="general" className="w-full mt-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="spots">Spots</TabsTrigger>
          <TabsTrigger value="Polygons">Polygons</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="spots">Change your password here.</TabsContent>
        <TabsContent value="polygons">Change your password here.</TabsContent>
      </Tabs>{" "}
    </div>
  );
}
