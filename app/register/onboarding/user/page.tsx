"use client";

import { useUser } from "@/contexts/user/UserContext";
import { useRouter } from "next/navigation";
import { z } from "zod";

import React, { useEffect, useRef, useState } from "react";
import Map3D from "@/components/Map3D";
import { Coordinate, Map3dEvent } from "@/type/maps";
import { loader } from "@/lib/maps";
import { USER_REGISTRATION_MARKER } from "@/const/maps";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
const formSchema = z.object({
  bio: z.string().max(500),
});
export default function UserOnboarding() {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preferredPosition, setPreferredPosition] = useState<Omit<
    Coordinate,
    "altitude"
  > | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const { currentUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: "",
    },
  });

  useEffect(() => {
    if (currentUser?.profile) router.push("/maps");
  }, [currentUser]);

  useEffect(() => {
    loader.load().then(async () => {
      // @ts-ignore
      const { Marker3DElement } = (await google.maps.importLibrary(
        "maps3d"
      )) as google.maps.Maps3DLibrary;
      const handleMapClick: EventListenerOrEventListenerObject = (basicE) => {
        const e: Map3dEvent = basicE as Map3dEvent;

        const marker = new Marker3DElement({
          position: { lat: e.position.lat, lng: e.position.lng },
        });

        if (map) {
          const oldMarker = document.querySelector(
            `#${USER_REGISTRATION_MARKER}`
          );
          oldMarker?.remove();

          marker.id = USER_REGISTRATION_MARKER;
          map.append(marker);
          setPreferredPosition({ lat: e.position.lat, lng: e.position.lng });
        }
      };
      if (map) {
        map.addEventListener("gmp-click", handleMapClick);
      }

      return () => {
        map?.removeEventListener("gmp-click", handleMapClick);
      };
    });
  }, [map]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let errorMsg = "Something went wrong.";
    let hasError = false;

    try {
      router.push("/register/onboarding/user");
    } catch (error) {
      if (error instanceof Error) errorMsg = error.message;
      hasError = true;
    } finally {
      if (hasError)
        toast({
          title: "Registration Failed",
          variant: "destructive",
          description: errorMsg,
        });
      setIsLoading(false);
    }
  }
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-semibold">Setup Your Profile</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-4">
            <div className="grow">
              <FormLabel>Preferred Location</FormLabel>
              <FormDescription>
                Choose your location. It doesn&apos;t have to be where you live.
                It could be places where you frequent, like a hangout spot.
              </FormDescription>
            </div>
            <div>
              <Input placeholder="Search" className="" />
              <Map3D
                mapRef={mapRef}
                setMap={setMap}
                className="h-96 w-[500px] relative"
              ></Map3D>
            </div>
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea placeholder="Your bio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex">
            <Button type="submit" className="ml-auto" disabled={isLoading}>
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
