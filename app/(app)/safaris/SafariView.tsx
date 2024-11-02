"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Safari, SafariSpot, SafariStatus } from "@/type";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import React, { useContext, useState } from "react";
import { SafariPageContext, SafariPageMode, SafariViewMode } from "./page";
import SafariStatusBadge from "./SafariStatusBadge";
import { MapPin, Search, Box } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useUser } from "@/contexts/user/UserContext";
import { useToast } from "@/hooks/use-toast";
import { config, databases } from "@/lib/appwrite";
import { ID, Permission, Role } from "appwrite";
import PlaceDisplay from "@/components/PlaceDisplay";
const safariSpotFormSchema = z.object({
  name: z.string().min(5).max(50),
  description: z.string().max(500),
});

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
  } = useContext(SafariPageContext);

  const { currentUser } = useUser();

  const { toast } = useToast();

  const [spotCreateLoading, setSpotCreateLoading] = useState(false);

  const safariSpotForm = useForm<z.infer<typeof safariSpotFormSchema>>({
    resolver: zodResolver(safariSpotFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof safariSpotFormSchema>) {
    let errorMsg = "Something went wrong.";
    let hasError = false;

    if (!currentUser || !selectedSafari) return;

    try {
      setSpotCreateLoading(true);

      const createdSpot = (await databases.createDocument(
        config.dbId,
        config.safariStopCollectionId,
        ID.unique(),
        {
          name: values.name,
          description: values.description,
          safariId: selectedSafari.$id,
        },
        [
          Permission.update(Role.user(currentUser.$id)),
          Permission.delete(Role.user(currentUser.$id)),
        ]
      )) as SafariSpot;
    } catch (error) {
      if (error instanceof Error) errorMsg = error.message;
      hasError = true;
    } finally {
      if (hasError)
        toast({
          title: "User Onboarding Failed",
          variant: "destructive",
          description: errorMsg,
        });
      setSpotCreateLoading(false);
    }
  }

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
        <Separator className="mt-4 mb-2" />

        <ToggleGroup
          type="multiple"
          className=""
          value={[safariViewMode]}
          onValueChange={(val) => {
            setSafariViewMode((prev) => {
              console.log({ val });
              if (val.length > 0) return val[val.length - 1] as SafariViewMode;

              return SafariViewMode.ROUTE;
            });
          }}
        >
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

      <div className="absolute top-44 left-4 bg-white rounded-md shadow-md z-10 p-4 bottom-4">
        <Form {...safariSpotForm}>
          <form
            onSubmit={safariSpotForm.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="flex gap-4">
              <div className="space-y-4 grow">
                <FormField
                  control={safariSpotForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grow">
                      <FormLabel>Activity Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="What do you plan to do here?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={safariSpotForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your activity"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex">
              <Button
                type="submit"
                className="ml-auto"
                disabled={spotCreateLoading}
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {place && (
        <div className="absolute right-4 top-44 bottom-4 rounded-md shadow-md z-10 bg-white p-4">
          <PlaceDisplay place={place} />
        </div>
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
